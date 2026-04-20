







const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require('../models/Product');
require("dotenv").config(); // Load .env file
const User = require("../models/User");
const { sendDairyOrderConfirmationEmail } = require("./mailer");
const mongoose = require('mongoose');
const DeliveryBoy = require('../models/DeliveryBoy');
const OrderAssignment = require('../models/OrderAssignment');
const { sendDeliveryAssignmentEmail, sendAdminNotificationEmail } = require('./mailer');

const currency = "inr";
const deliveryCharge = 10;

const createOrder = async (req, res) => {
  try {
    console.log("Request received:", req.body);
    const { items, totalAmount, paymentMethod, address, paymentIntentId } = req.body;

    if (!items || !items.length || !totalAmount || !paymentMethod || !address) {
      return res.status(400).json({ message: "Missing required fields in the order" });
    }

    const finalAmount = totalAmount + deliveryCharge;

    let paymentIntent;

    // Handle payment based on payment method
    if (paymentMethod === "card") {
      // Create or retrieve payment intent with Stripe
      if (!paymentIntentId) {
        paymentIntent = await stripe.paymentIntents.create({
          amount: finalAmount * 100, // Convert to smallest currency unit
          currency,
          payment_method_types: ["card"],
        });
      } else {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      }

      if (!paymentIntent) {
        return res.status(500).json({ message: "Unable to process payment with Stripe" });
      }
    }

    // Create the order
    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount: finalAmount,
      paymentMethod,
      paymentIntentId: paymentIntent ? paymentIntent.id : null,
      address,
      status: "Pending"
    });

    // Populate product details for email
    await order.populate({
      path: 'items.productId',
      select: 'productName price image unit'
    });

    // Send order confirmation email to customer
    try {
      const user = await User.findById(req.user.id);
      if (user && user.email) {
        // Format items for email with proper product details
        const formattedItems = order.items.map(item => ({
          name: item.productId ? item.productId.productName : item.productName,
          quantity: item.quantity,
          price: item.productId ? item.productId.price : item.price,
          unit: item.productId ? item.productId.unit : item.unit,
          image: item.productId && item.productId.image ? item.productId.image : null,
          totalPrice: (item.quantity * (item.productId ? item.productId.price : item.price)).toFixed(2)
        }));
        
        await sendOrderConfirmationEmail(user.email, formattedItems, order.totalAmount, address, order._id);
        console.log("Dairy order confirmation email sent successfully");
      } else {
        console.log("User email not found, skipping order confirmation email");
      }
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    // Try to find a suitable delivery boy based on address zipcode and area
    try {
      // Import OrderAssignment model here to avoid circular dependencies
      const OrderAssignment = require('../models/OrderAssignment');
      
      // Extract zipcode and area from address
      const zipcode = address.zipcode || '';
      const addressArea = address.street ? address.street.toLowerCase() : '';
      const city = address.city ? address.city.toLowerCase() : '';
      
      console.log(`Looking for delivery boys for zipcode: ${zipcode}, area: ${addressArea}, city: ${city}`);
      
      // Find delivery boys available for this zipcode
      let availableDeliveryBoys = [];
      
      if (zipcode) {
        availableDeliveryBoys = await DeliveryBoy.find({
          isAvailable: true,
          pincodes: zipcode
        });
        
        console.log(`Found ${availableDeliveryBoys.length} delivery boys for zipcode ${zipcode}`);
      }
      
      // If no delivery boy found for specific zipcode, get any available delivery boy
      if (availableDeliveryBoys.length === 0) {
        availableDeliveryBoys = await DeliveryBoy.find({
          isAvailable: true
        });
        console.log(`Found ${availableDeliveryBoys.length} generally available delivery boys`);
      }
      
      // Filter delivery boys who haven't reached their daily limit
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const eligibleDeliveryBoys = [];
      
      for (const boy of availableDeliveryBoys) {
        const todayAssignments = await OrderAssignment.countDocuments({
          deliveryBoyId: boy._id,
          createdAt: { $gte: todayStart, $lte: todayEnd }
        });
        
        if (todayAssignments < boy.maxOrdersPerDay) {
          // Check if delivery boy serves the specific area in the address
          let areaMatch = false;
          if (boy.areas && boy.areas.length > 0) {
            for (const area of boy.areas) {
              const areaLower = area.toLowerCase();
              if (
                (addressArea && addressArea.includes(areaLower)) || 
                (city && city.includes(areaLower)) ||
                (areaLower.includes(addressArea) && addressArea)
              ) {
                areaMatch = true;
                break;
              }
            }
          }
          
          eligibleDeliveryBoys.push({
            deliveryBoy: boy,
            currentAssignments: todayAssignments,
            areaMatch: areaMatch // Add area match flag
          });
        }
      }
      
      // Sort by area match first, then by least number of current assignments
      eligibleDeliveryBoys.sort((a, b) => {
        // First prioritize area match
        if (a.areaMatch && !b.areaMatch) return -1;
        if (!a.areaMatch && b.areaMatch) return 1;
        
        // Then sort by current assignments
        return a.currentAssignments - b.currentAssignments;
      });
      
      console.log('Eligible delivery boys (sorted):', eligibleDeliveryBoys.map(item => ({
        name: item.deliveryBoy.name,
        email: item.deliveryBoy.email,
        areaMatch: item.areaMatch,
        currentAssignments: item.currentAssignments
      })));
      
      // Assign to the first available delivery boy
      if (eligibleDeliveryBoys.length > 0) {
        const selectedDeliveryBoy = eligibleDeliveryBoys[0].deliveryBoy;
        console.log(`Selected delivery boy: ${selectedDeliveryBoy.name} (${selectedDeliveryBoy.email})`);
        
        // Create assignment
        const assignment = new OrderAssignment({
          orderId: order._id,
          deliveryBoyId: selectedDeliveryBoy._id,
          status: 'Assigned',
          notes: 'Automatically assigned',
          statusHistory: [{
            status: 'Assigned',
            timestamp: new Date(),
            notes: 'Automatically assigned during order creation'
          }]
        });
        
        await assignment.save();
        
        // Update order status
        order.status = 'Out for Delivery';
        await order.save();
        
        // Update delivery boy's current orders
        selectedDeliveryBoy.currentOrders.push(order._id);
        await selectedDeliveryBoy.save();
        
        // Send email to delivery boy with proper error handling
        try {
          const orderassignmentcontroller = require('./orderAssignmentController');
          await orderAssignmentController.sendDeliveryAssignmentEmail(selectedDeliveryBoy, order, assignment);
          console.log(`Order ${order._id} automatically assigned to delivery boy ${selectedDeliveryBoy.name}`);
          
          // Send notification to admin about the assignment
          try {
            await orderAssignmentController.sendAdminNotificationEmail(
              order, 
              'Assigned', 
              `Order automatically assigned to delivery boy ${selectedDeliveryBoy.name}`,
              selectedDeliveryBoy
            );
            console.log("Dairy order notification email sent to admin successfully");
          } catch (adminEmailError) {
            console.error('Error sending admin notification email:', adminEmailError);
            // Don't fail if admin email sending fails
          }
        } catch (emailError) {
          console.error('Error sending delivery assignment email:', emailError);
          // Don't fail if email sending fails
        }
      } else {
        console.log(`No eligible delivery boys found for order ${order._id}`);
      }
    } catch (assignmentError) {
      console.error('Error during automatic delivery assignment:', assignmentError);
      // Don't fail the order creation if assignment fails
    }

    // Return the created order
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
      clientSecret: paymentIntent ? paymentIntent.client_secret : null
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// const createOrder = async (req, res) => {
  

//   try {
//     console.log("Request received:", req.body); // Log the incoming request body
//     const { items, totalAmount, paymentMethod, address, paymentIntentId } =
//       req.body;

//     if (!items || !items.length || !totalAmount || !paymentMethod || !address) {
//       return res
//         .status(400)
//         .json({ message: "Missing required fields in the order" });
//     }

//     const finalAmount = totalAmount + deliveryCharge;

//     // Format items to match the schema
//     const formattedItems = items.map(item => ({
//       productId: item.product, // Convert 'product' to 'productId'
//       quantity: item.quantity,
//       price: item.price
//     }));

//     // Make sure userId is set from req.user
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     const order = new Order({
//       userId: req.user._id,
//       items: formattedItems,
//       totalAmount: finalAmount,
//       paymentMethod,
//       address,
//     });

//     const savedOrder = await order.save();

//     // Auto-assign delivery boy
   
    
//     res.status(201).json({
//       success: true,
//       order: savedOrder,
//       message: "Order created successfully",
//     });
//   } catch (error) {
//     console.error("Error in createOrder:", error.message); // Log errors
//     res.status(500).json({ message: error.message });
//   }
// };


//   try {
//     console.log("Request received:", req.body); // Log the incoming request body
//     const { items, totalAmount, paymentMethod, address, paymentIntentId } =
//       req.body;

//     if (!items || !items.length || !totalAmount || !paymentMethod || !address) {
//       return res
//         .status(400)
//         .json({ message: "Missing required fields in the order" });
//     }

//     const finalAmount = totalAmount + deliveryCharge;

//     let paymentIntent;

//     // Handle payment based on payment method
//     if (paymentMethod === "card") {
//       if (!paymentIntentId) {
//         // Create a new payment intent if one is not provided
//         paymentIntent = await stripe.paymentIntents.create({
//           amount: finalAmount * 100, // Convert to smallest currency unit (e.g., paise for INR)
//           currency,
//           payment_method_types: ["card"],
//         });
//       } else {
//         // Retrieve existing payment intent
//         paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//       }

//       if (!paymentIntent) {
//         return res
//           .status(500)
//           .json({ message: "Unable to process payment with Stripe" });
//       }
//     }

//     // Fix: Check if req.user exists and use userId from body if not
//     const userId = req.user ? req.user.id : (req.body.userId || null);
    
//     if (!userId) {
//       return res
//         .status(400)
//         .json({ message: "User ID is required. Please login or provide userId in the request." });
//     }

//     const order = await Order.create({
//       userId: userId, // Changed from user: req.user.id
//       items,
//       totalAmount: finalAmount,
//       paymentMethod,
//       paymentIntentId: paymentIntent ? paymentIntent.id : null,
//       status: paymentMethod === "card" ? "Pending Payment" : "Processing",
//       address,
//     });

//     // No need to save again as Order.create already saves the document
//     try {
//       const assignment = await autoAssignDeliveryBoyToOrder(order._id);
//       if (assignment) {
//         console.log(`Order ${order._id} automatically assigned to delivery boy ${assignment.deliveryBoyId}`);
//       } else {
//         console.log(`No delivery boy available for automatic assignment to order ${order._id}`);
//       }
//     } catch (assignmentError) {
//       console.error('Error in auto-assignment:', assignmentError);
//       // Don't fail the order creation if assignment fails
//     }
    
//     res
//       .status(201)
//       .json({
//         order,
//         clientSecret: paymentIntent ? paymentIntent.client_secret : null,
//         message: "Order created successfully",
//       });
//   } catch (error) {
//     console.error("Error in createOrder:", error.message); // Log errors
//     res.status(500).json({ message: error.message });
//   }
// };
// Other methods remain unchanged
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to the order" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('items.productId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email"); // Populate userId to get name and email
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const extractPincode = (address) => {
  const match = address.street.match(/\b\d{6}\b/); // Extract 6-digit pincode
  return match ? match[0] : null;
};


// const placeOrder = async (req, res) => {
//   try {
//     const { items, totalAmount, address, paymentMethod } = req.body;
//     const userId = req.user?._id;

//     console.log(`📥 Received Order Data: ${JSON.stringify(req.body, null, 2)}`);

//     if (!userId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount || !address || !paymentMethod) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required and items must be a non-empty array.",
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const zipcode = extractPincode(address);
//     console.log(`📍 Extracted Pincode: ${zipcode}`);

//     if (!zipcode) {
//       return res.status(400).json({ success: false, message: "Invalid address. Could not extract pin code." });
//     }

//     const updatedItems = await Promise.all(
//       items.map(async (item) => {
//         const product = await Product.findById(item.productId);
//         if (!product) throw new Error(`Product not found: ${item.productId}`);
//         return {
//           productId: item.productId,
//           quantity: item.quantity,
//           price: product.price,
//           productName: product.productName || item.productName,
//         };
//       })
//     );

//     const newOrder = new Order({
//       userId,
//       items: updatedItems,
//       totalAmount,
//       address,
//       paymentMethod,
//       payment: false,
//       date: new Date(),
//       status: "Pending",
//     });

//     const savedOrder = await newOrder.save();

//     let availableDeliveryBoys = await DeliveryBoy.find({
//       isAvailable: true,
//       pincodes: zipcode,
//     }).select("_id name email phone pincodes maxOrdersPerDay currentOrders");

//     if (availableDeliveryBoys.length === 0) {
//       availableDeliveryBoys = await DeliveryBoy.find({ isAvailable: true }).select("_id name email phone pincodes maxOrdersPerDay currentOrders");
//     }

//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const eligibleDeliveryBoys = [];

//     for (const boy of availableDeliveryBoys) {
//       const todayAssignments = await OrderAssignment.countDocuments({
//         deliveryBoyId: boy._id,
//         createdAt: { $gte: todayStart, $lte: todayEnd },
//       });

//       const maxOrders = boy.maxOrdersPerDay || 10;

//       if (todayAssignments < maxOrders) {
//         eligibleDeliveryBoys.push({
//           deliveryBoy: boy,
//           currentAssignments: todayAssignments,
//           isPincodeMatch: boy.pincodes.includes(zipcode),
//         });
//       }
//     }

//     eligibleDeliveryBoys.sort((a, b) => {
//       if (a.isPincodeMatch && !b.isPincodeMatch) return -1;
//       if (!a.isPincodeMatch && b.isPincodeMatch) return 1;
//       return a.currentAssignments - b.currentAssignments;
//     });

//     if (eligibleDeliveryBoys.length > 0) {
//       const selectedDeliveryBoy = eligibleDeliveryBoys[0].deliveryBoy;

//       const assignment = new OrderAssignment({
//         orderId: savedOrder._id,
//         deliveryBoyId: selectedDeliveryBoy._id,
//         status: "Assigned",
//         notes: "Automatically assigned",
//         statusHistory: [
//           {
//             status: "Assigned",
//             timestamp: new Date(),
//             notes: "Automatically assigned during order creation",
//           },
//         ],
//       });

//       await assignment.save();
//       savedOrder.status = "Out for Delivery";
//       await savedOrder.save();

//       await DeliveryBoy.findByIdAndUpdate(
//         selectedDeliveryBoy._id,
//         { $push: { currentOrders: savedOrder._id } },
//         { runValidators: false }
//       );

//       await sendDeliveryAssignmentEmail(selectedDeliveryBoy.email, savedOrder._id, savedOrder.totalAmount);
//     }

//     res.status(201).json({ success: true, message: "Order placed successfully", order: savedOrder });
//   } catch (error) {
//     console.error("Order placement error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//   }
// };

const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentMethod } = req.body;
    const userId = req.user?._id;

    console.log(`📥 Received Order Data: ${JSON.stringify(req.body, null, 2)}`);
    console.log(`📥 User ID: ${req.user?._id}`);

    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount || !address || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "All fields are required and items must be a non-empty array.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const zipcode = extractPincode(address);
    console.log(`📍 Extracted Pincode: ${zipcode}`);

    if (!zipcode) {
      return res.status(400).json({ success: false, message: "Invalid address. Could not extract pin code." });
    }

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          productName: product.productName || item.productName,
        };
      })
    );

    const newOrder = new Order({
      userId,
      items: updatedItems,
      totalAmount,
      address,
      paymentMethod,
      payment: false,
      date: new Date(),
      status: "Pending",
    });

    const savedOrder = await newOrder.save();
    await savedOrder.populate({
      path: "items.productId",
      select: "productName price image unit",
    });

    try {
      const formattedItems = savedOrder.items.map((item) => ({
        name: item.productId ? item.productId.productName : item.productName,
        quantity: item.quantity,
        price: item.productId ? item.productId.price : item.price,
        unit: item.productId ? item.productId.unit : "",
        image: item.productId && item.productId.image ? item.productId.image : null,
        totalPrice: (item.quantity * (item.productId ? item.productId.price : item.price)).toFixed(2),
      }));

      console.log(`Admin email: ${process.env.EMAIL_USER}`);

      await sendDairyOrderConfirmationEmail(user.email, formattedItems, savedOrder.totalAmount, address, savedOrder._id);
      console.log("Order confirmation email sent to customer successfully");
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError);
    }

    let availableDeliveryBoys = await DeliveryBoy.find({
      isAvailable: true,
      pincodes: zipcode,
    }).select("_id name email phone pincodes maxOrdersPerDay currentOrders");

    if (availableDeliveryBoys.length === 0) {
      availableDeliveryBoys = await DeliveryBoy.find({ isAvailable: true }).select("_id name email phone pincodes maxOrdersPerDay currentOrders");
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const eligibleDeliveryBoys = [];

    for (const boy of availableDeliveryBoys) {
      const todayAssignments = await OrderAssignment.countDocuments({
        deliveryBoyId: boy._id,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });

      const maxOrders = boy.maxOrdersPerDay || 10;

      if (todayAssignments < maxOrders) {
        eligibleDeliveryBoys.push({
          deliveryBoy: boy,
          currentAssignments: todayAssignments,
          isPincodeMatch: boy.pincodes.includes(zipcode),
        });
      }
    }

    eligibleDeliveryBoys.sort((a, b) => {
      if (a.isPincodeMatch && !b.isPincodeMatch) return -1;
      if (!a.isPincodeMatch && b.isPincodeMatch) return 1;
      return a.currentAssignments - b.currentAssignments;
    });

    if (eligibleDeliveryBoys.length > 0) {
      const selectedDeliveryBoy = eligibleDeliveryBoys[0].deliveryBoy;

      const assignment = new OrderAssignment({
        orderId: savedOrder._id,
        deliveryBoyId: selectedDeliveryBoy._id,
        status: "Assigned",
        notes: "Automatically assigned",
        statusHistory: [
          {
            status: "Assigned",
            timestamp: new Date(),
            notes: "Automatically assigned during order creation",
          },
        ],
      });

      await assignment.save();
      savedOrder.status = "Out for Delivery";
      await savedOrder.save();

      await DeliveryBoy.findByIdAndUpdate(
        selectedDeliveryBoy._id,
        { $push: { currentOrders: savedOrder._id } },
        { runValidators: false }
      );

      await sendDeliveryAssignmentEmail(selectedDeliveryBoy.email, savedOrder._id, savedOrder.totalAmount);
    }

    res.status(201).json({ success: true, message: "Order placed successfully", order: savedOrder });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};



const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await Order.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const placeOrderStripe = async (req, res) => {
  res.status(501).json({ message: "Stripe payment not implemented yet" });
};

const placeOrderRazorpay = async (req, res) => {
  res.status(501).json({ message: "Razorpay payment not implemented yet" });
};

const updateOrderStatus = async (req, res) => {
  try {
    const { _id, status, tentativeDeliveryDate } = req.body;

    // Prepare the update object
    const updateData = { status };

    // Only add tentativeDeliveryDate to the update if it's provided
    if (tentativeDeliveryDate) {
      updateData.tentativeDeliveryDate = new Date(tentativeDeliveryDate);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      _id,
      updateData,
      { new: true } // This option returns the updated document
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order Updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { _id, payment } = req.body;

    await Order.findByIdAndUpdate(_id, { payment });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// return order ----------
const updateReturnAction = async (req, res) => {
  try {
    const { _id, productId } = req.params; // Extract order ID and product ID from URL params
    console.log("Order ID:----------->", _id);
    console.log("Product ID:", productId);
    const { action } = req.body; // Extract action from request body

    if (!action) {
      return res
        .status(400)
        .json({ success: false, message: "Action is required" });
    }
    const specifyStatus = action === "accepted" ? true : false;

    const order = await Order.findOneAndUpdate(
      { _id, "items.productId": productId }, // Find the order and specific product
      {
        $set: {
          "items.$.action": action,
          "items.$.returnApproved": specifyStatus,
        },
      }, // Update only the specific product's action
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order or Product not found" });
    }

    res.json({ success: true, message: "Action Updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const returnProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    const order = await Order.findOne({ _id: orderId });
    console.log(orderId);
    console.log(productId);
    console.log(req.user._id.toString());

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemIndex = order.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    const item = order.items[itemIndex];
    if (item.returnRequested) {
      return res
        .status(400)
        .json({ message: "Return already requested for this product" });
    }

    item.returnRequested = true;
    await order.save();

    res.status(200).json({ message: "Return request submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveReturnReason = async (req, res) => {
  try {
    const { orderId, productId, reason } = req.body;

    if (!orderId || !productId || !reason) {
      return res
        .status(400)
        .json({ message: "OrderId, ProductId, and Reason are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!item) {
      return res
        .status(404)
        .json({ message: "Product not found in the order" });
    }

    item.returnReason = reason;
    item.returnRequested = true;

    await order.save();

    res
      .status(200)
      .json({ message: "Return reason saved successfully", data: order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving return reason", error: error.message });
  }
};


const getReturnOrder = async (req, res) => {
  try {
    // Fetch orders where returnRequested is true in items
    const orders = await Order.find({ "items.returnRequested": true })
      .populate("userId", "firstName lastName email")
      .populate("items.productId", "name")

    // If no orders found
    if (!orders.length) {
      return res.status(404).json({ message: "No return requests found" })
    }

    // Format the fetched orders
    const formattedOrders = orders.flatMap((order) =>
      order.items
        .filter((item) => item.returnRequested)
        .map((returnItem) => {
          const productName = returnItem.productId ? returnItem.productId.name : "Unknown Product"

          return {
            _id: order._id,
            productName: productName,
            productId: returnItem.productId ? returnItem.productId._id : null,
            firstName: order.userId ? order.userId.firstName : "Unknown",
            lastName: order.userId ? order.userId.lastName : "Unknown",
            email: order.userId ? order.userId.email : "Unknown",
            street: order.address ? order.address.street : "Unknown",
            landmark: order.address ? order.address.landmark : "Unknown",
            city: order.address ? order.address.city : "Unknown",
            zipcode: order.address ? order.address.zipcode : "Unknown",
            country: order.address ? order.address.country : "Unknown",
            state: order.address ? order.address.state : "Unknown",
            phone: order.address ? order.address.phone : "Unknown",
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            returnReason: returnItem.returnReason || "N/A",
            status: returnItem.returnApproved ? "Return Approved" : "Return Requested",
          }
        }),
    )

    res.status(200).json(formattedOrders)
  } catch (error) {
    console.error("Error in getReturnOrder:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
const updateReturnStatus = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { action } = req.body;

    console.log("Received orderId:", orderId);
    console.log("Received productId:", productId);
    console.log("Received action:", action);

    // Check if orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderId format" });
    }

    // Find the order by orderId
    const order = await Order.findById(orderId);
    console.log("Order fetched:", order);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Find the specific product in the order's items array
    const itemIndex = order.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    console.log("🔹 Item index:", itemIndex);

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in order" });
    }

    // Update the action field
    order.items[itemIndex].action = action;

    // Save the updated order
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Action updated successfully", order });
  } catch (error) {
    console.error(" Error updating return status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// controller.js or wherever your logic resides

const updateItemStatus = async (req, res) => {
  try {
    const { productId } = req.params; // Product ID passed in URL parameter
    const { action } = req.body; // Action passed in the body (either "block" or "active")
    const status = action === "block" ? "block" : "active"; // Determine status based on action

    console.log(`Received productId: ${productId}, Action: ${action}`);

    // Try finding the order with productId as string (no ObjectId conversion needed)
    const order = await Order.findOne({ "items.productId": productId }); // Query with productId as string
    console.log("Found order with string productId?", !!order);

    if (!order) {
      console.log("Order or Item not found.");
      return res.status(404).json({ success: false, message: "Order or Item not found" });
    }

    // Find the order and update the item status using the string productId
    const updatedOrder = await Order.findOneAndUpdate(
      { "items.productId": productId }, // Use string comparison for productId
      { 
        $set: { 
          "items.$.status": status, // Update the status
          "items.$.action": status === "block" ? "block" : "unblock" // Update the action based on status
        } 
      },
      { new: true } // Return the updated order document
    );

    console.log("Updated Order:", updatedOrder);

    // If no order was updated, return an error
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order or Item not found" });
    }

    // Return the updated order in the response
    return res.json({ success: true, message: "Item status updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error updating item status:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

 module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  updatePaymentStatus,
  updateOrderStatus,
  userOrders,
  updateReturnAction,
  returnProduct,
  saveReturnReason,
  getReturnOrder,
  updateReturnStatus,
  updateItemStatus,
};
