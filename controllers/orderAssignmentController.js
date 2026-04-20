




// const User = require('../models/User');
// const Order = require('../models/Order');
// const DeliveryBoy = require('../models/DeliveryBoy');
// const OrderAssignment = require('../models/OrderAssignment');
// const nodemailer = require('nodemailer');
// const mongoose = require('mongoose');

// // Generate a secure token for status updates via email
// const generateStatusUpdateToken = (assignmentId, deliveryBoyId) => {
//   // In a real app, use a proper JWT or other secure token method
//   // This is a simplified version for demonstration
//   const data = `${assignmentId}:${deliveryBoyId}:${process.env.JWT_SECRET || 'parshuram-dairy-secret'}`;
//   return require('crypto').createHash('sha256').update(data).digest('hex');
// };

// // Helper function to send email to delivery boy
// // Helper function to send email to delivery boy
// const sendDeliveryAssignmentEmail = async (deliveryBoy, order, assignment) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       // Add these settings to reduce spam likelihood
//       tls: {
//         rejectUnauthorized: false
//       },
//       secure: true
//     });

//     // Get customer details
//     const customer = await User.findById(order.userId);
    
//     // Format the order items for email with error handling
//     const itemsHtml = order.items.map(item => {
//       // Handle potential undefined values with fallbacks
//       const productId = item.productId || {};
//       const productName = productId.productName || 'Product';
//       const productUnit = productId.unit || 'unit';
//       const productPrice = productId.price || 0;
      
//       const productImage = productId.image 
//         ? `<img src="https://parshuram-dairy-backend.onrender.com/Images/${productId.image}" 
//                alt="${productName}" 
//                style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">`
//         : '';
        
//       return `
//         <tr>
//           <td style="padding: 12px; border-bottom: 1px solid #eee; width: 70px;">
//             ${productImage}
//           </td>
//           <td style="padding: 12px; border-bottom: 1px solid #eee;">
//             <strong>${productName}</strong>
//           </td>
//           <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
//             ${item.quantity || 1} ${productUnit}
//           </td>
//           <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
//             ₹${productPrice.toFixed(2)}
//           </td>
//           <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
//             ₹${((item.quantity || 1) * productPrice).toFixed(2)}
//           </td>
//         </tr>
//       `;
//     }).join('');

//     // Format the delivery address
//     const addressHtml = `
//       <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #4CAF50;">
//         <h3 style="margin-top: 0; color: #333; font-size: 18px;">Delivery Address:</h3>
//         <p style="margin: 5px 0;"><strong>Customer:</strong> ${customer ? customer.name : 'N/A'}</p>
//         <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer ? customer.phone : 'N/A'}</p>
//         <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address.street || 'N/A'}</p>
//         <p style="margin: 5px 0;"><strong>City:</strong> ${order.address.city || 'N/A'}</p>
//         <p style="margin: 5px 0;"><strong>State:</strong> ${order.address.state || 'N/A'}</p>
//         <p style="margin: 5px 0;"><strong>Zipcode:</strong> ${order.address.zipcode || 'N/A'}</p>
//       </div>
//     `;

//     // Generate status update tokens
//     const inProgressToken = generateStatusUpdateToken(assignment._id, deliveryBoy._id);
//     const deliveredToken = generateStatusUpdateToken(assignment._id, deliveryBoy._id);
//     const failedToken = generateStatusUpdateToken(assignment._id, deliveryBoy._id);

//     // Create status update links - use production URL if available
//     const baseUrl = process.env.BACKEND_URL || 'https://parshuram-dairy-backend.onrender.com';
//     const inProgressLink = `${baseUrl}/api/delivery/update-status/${assignment._id}/In%20Progress/${inProgressToken}`;
//     const deliveredLink = `${baseUrl}/api/delivery/update-status/${assignment._id}/Delivered/${deliveredToken}`;
//     const failedLink = `${baseUrl}/api/delivery/update-status/${assignment._id}/Failed/${failedToken}`;

//     const mailOptions = {
//       from: {
//         name: "Parshuram Dairy Farm",
//         address: process.env.EMAIL_USER
//       },
//       to: deliveryBoy.email,
//       subject: `New Delivery Assignment - Order #${order._id.toString().slice(-6)}`,
//       html: `
//         <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
//           <div style="text-align: center; margin-bottom: 20px;">
//             <img src="https://parshuram-dairy-backend.onrender.com/Images/logo.png" alt="Parshuram Dairy Logo" style="max-width: 150px; height: auto;">
//           </div>
          
//           <div style="background-color: #4CAF50; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
//             <h1 style="color: white; margin: 0; font-size: 24px;">New Delivery Assignment</h1>
//           </div>
          
//           <div style="padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #fff;">
//             <p style="font-size: 16px;">Hello ${deliveryBoy.name},</p>
//             <p style="font-size: 16px;">You have been assigned a new order for delivery. Please find the details below:</p>
            
//             <div style="margin: 25px 0; padding: 15px; background-color: #f0f8ff; border-radius: 8px; border-left: 4px solid #4CAF50;">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Order Information:</h3>
//               <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
//               <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//               <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
//               <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
//               <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">${assignment.status}</span></p>
//             </div>
            
//             ${addressHtml}
            
//             <h3 style="margin-top: 30px; color: #333; font-size: 18px;">Order Items:</h3>
//             <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//               <thead>
//                 <tr style="background-color: #f5f5f5;">
//                   <th style="padding: 12px; text-align: left; width: 70px;"></th>
//                   <th style="padding: 12px; text-align: left;">Product</th>
//                   <th style="padding: 12px; text-align: center;">Quantity</th>
//                   <th style="padding: 12px; text-align: right;">Price</th>
//                   <th style="padding: 12px; text-align: right;">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${itemsHtml}
//               </tbody>
//               <tfoot>
//                 <tr style="background-color: #f9f9f9; font-weight: bold;">
//                   <td colspan="4" style="padding: 12px; text-align: right;">Total:</td>
//                   <td style="padding: 12px; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
//                 </tr>
//               </tfoot>
//             </table>
            
//             <div style="margin-top: 30px; text-align: center;">
//               <p style="margin-bottom: 15px; font-weight: bold; font-size: 16px;">Update Delivery Status:</p>
//               <a href="${inProgressLink}" 
//                  style="display: inline-block; margin: 0 5px 10px 5px; padding: 12px 20px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
//                 In Progress
//               </a>
//               <a href="${deliveredLink}" 
//                  style="display: inline-block; margin: 0 5px 10px 5px; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
//                 Delivered
//               </a>
//               <a href="${failedLink}" 
//                  style="display: inline-block; margin: 0 5px 10px 5px; padding: 12px 20px; background-color: #F44336; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
//                 Failed
//               </a>
//             </div>
            
//             <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Need Help?</h3>
//               <p style="margin-bottom: 15px;">If you have any questions about this delivery, please contact us:</p>
//               <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:parshuramdairyfarm@gmail.com" style="color: #4CAF50;">parshuramdairyfarm@gmail.com</a></p>
//               <p style="margin: 5px 0;"><strong>Phone:</strong> +91 9876543210</p>
//             </div>
            
//             <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            
//             <p style="font-size: 14px; color: #777; text-align: center;">
//               Thank you for your service with Parshuram Dairy!
//             </p>
//           </div>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Delivery assignment email sent to ${deliveryBoy.email}`);
//     return true;
//   } catch (error) {
//     console.error('Error sending delivery assignment email:', error);
//     return false;
//   }
// };

// // Create a new assignment
// const createAssignment = async (req, res) => {
//   try {
//     const { orderId, deliveryBoyId, status, notes } = req.body;
    
//     // Check if order exists
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     // Check if delivery boy exists
//     const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
//     if (!deliveryBoy) {
//       return res.status(404).json({
//         success: false,
//         message: 'Delivery boy not found'
//       });
//     }
    
//     // Check if order is already assigned
//     const existingAssignment = await OrderAssignment.findOne({ orderId });
//     if (existingAssignment) {
//       return res.status(400).json({
//         success: false,
//         message: 'Order is already assigned to a delivery boy'
//       });
//     }
    
//     // Create assignment
//     const assignment = new OrderAssignment({
//       orderId,
//       deliveryBoyId,
//       status: status || 'Assigned',
//       notes: notes || 'Assignment created',
//       statusHistory: [{
//         status: status || 'Assigned',
//         timestamp: new Date(),
//         notes: notes || 'Assignment created'
//       }]
//     });
    
//     await assignment.save();
    
//     // Update order status
//     order.status = 'Out for Delivery';
//     await order.save();
    
//     // Update delivery boy's current orders
//     deliveryBoy.currentOrders.push(orderId);
//     await deliveryBoy.save();
    
//     // Populate order details for email
//     await order.populate({
//       path: 'items.productId',
//       select: 'productName price image unit'
//     });
    
//     // Send email to delivery boy
//     await sendDeliveryAssignmentEmail(deliveryBoy, order, assignment);
    
//     res.status(201).json({
//       success: true,
//       message: 'Assignment created successfully',
//       assignment
//     });
//   } catch (error) {
//     console.error('Error creating assignment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create assignment',
//       error: error.message
//     });
//   }
// };

// // Delete an assignment
// const deleteAssignment = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const assignment = await OrderAssignment.findById(id);
//     if (!assignment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Assignment not found'
//       });
//     }
    
//     // Update order status back to pending
//     const order = await Order.findById(assignment.orderId);
//     if (order) {
//       order.status = 'Pending';
//       await order.save();
//     }
    
//     // Remove order from delivery boy's current orders
//     const deliveryBoy = await DeliveryBoy.findById(assignment.deliveryBoyId);
//     if (deliveryBoy) {
//       const orderIndex = deliveryBoy.currentOrders.indexOf(assignment.orderId);
//       if (orderIndex > -1) {
//         deliveryBoy.currentOrders.splice(orderIndex, 1);
//         await deliveryBoy.save();
//       }
//     }
    
//     // Delete the assignment
//     await OrderAssignment.findByIdAndDelete(id);
    
//     res.status(200).json({
//       success: true,
//       message: 'Assignment deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting assignment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete assignment',
//       error: error.message
//     });
//   }
// };

// // Get assignments by delivery boy
// const getAssignmentsByDeliveryBoy = async (req, res) => {
//   try {
//     const { deliveryBoyId } = req.params;
    
//     // Validate delivery boy exists
//     const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
//     if (!deliveryBoy) {
//       return res.status(404).json({
//         success: false,
//         message: 'Delivery boy not found'
//       });
//     }
    
//     // Get assignments for this delivery boy
//     const assignments = await OrderAssignment.find({ deliveryBoyId })
//       .populate({
//         path: 'orderId',
//         select: 'items totalAmount paymentMethod address status createdAt',
//         populate: {
//           path: 'items.productId',
//           select: 'productName price image unit'
//         }
//       })
//       .sort({ createdAt: -1 });
    
//     res.status(200).json({
//       success: true,
//       count: assignments.length,
//       assignments
//     });
//   } catch (error) {
//     console.error('Error getting assignments by delivery boy:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get assignments',
//       error: error.message
//     });
//   }
// };

// // Get assignments by order
// const getAssignmentsByOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     // Validate order exists
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     // Get assignments for this order
//     const assignments = await OrderAssignment.find({ orderId })
//       .populate({
//         path: 'deliveryBoyId',
//         select: 'name email phone'
//       })
//       .sort({ createdAt: -1 });
    
//     res.status(200).json({
//       success: true,
//       count: assignments.length,
//       assignments
//     });
//   } catch (error) {
//     console.error('Error getting assignments by order:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get assignments',
//       error: error.message
//     });
//   }
// };

// // Update assignment status
// const updateAssignmentStatus = async (req, res) => {
//   try {
//     const { assignmentId } = req.params;
//     const { status, notes } = req.body;
    
//     // Find the assignment
//     const assignment = await OrderAssignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ success: false, message: 'Assignment not found' });
//     }
    
//     // Update assignment status
//     assignment.status = status;
//     if (notes) {
//       assignment.notes = notes;
//     }
    
//     // Add to status history
//     assignment.statusHistory = assignment.statusHistory || [];
//     assignment.statusHistory.push({
//       status,
//       timestamp: new Date(),
//       notes: notes || `Status updated to ${status}`
//     });
    
//     await assignment.save();
    
//     // Update order status based on assignment status
//     const order = await Order.findById(assignment.orderId);
//     if (!order) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }
    
//     // Update order status based on assignment status
//     if (status === 'Delivered') {
//       order.status = 'Delivered';
      
//       // Update delivery boy status
//       const deliveryBoy = await DeliveryBoy.findById(assignment.deliveryBoyId);
//       if (deliveryBoy) {
//         const currentOrderIndex = deliveryBoy.currentOrders.indexOf(order._id);
//         if (currentOrderIndex > -1) {
//           deliveryBoy.currentOrders.splice(currentOrderIndex, 1);
//         }
        
//         // Increment total deliveries
//         deliveryBoy.totalDeliveries = (deliveryBoy.totalDeliveries || 0) + 1;
        
//         await deliveryBoy.save();
//       }
//     } else if (status === 'In Progress') {
//       order.status = 'Out for Delivery';
//     } else if (status === 'Failed') {
//       order.status = 'Delivery Failed';
//     }
    
//     await order.save();
    
//     // Send status update email to customer
//     await sendDeliveryStatusUpdateEmail(order, status, notes);
    
//     res.json({ success: true, message: 'Status updated successfully', assignment });
//   } catch (error) {
//     console.error('Error updating assignment status:', error);
//     res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
//   }
// };

// // Helper function to send delivery status update email to customer
// // Helper function to send delivery status update email to customer
// const sendDeliveryStatusUpdateEmail = async (order, status, notes) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       // Add these settings to reduce spam likelihood
//       tls: {
//         rejectUnauthorized: false
//       },
//       secure: true
//     });

//     // Get customer details
//     const customer = await User.findById(order.userId);
//     if (!customer || !customer.email) {
//       console.log('Customer email not found, skipping status update email');
//       return false;
//     }

//     // Set status color, message, and emoji based on status
//     let statusColor = '#4CAF50'; // Default green
//     let statusMessage = 'Your order is being processed.';
//     let statusEmoji = '🔄';
//     let statusImage = 'processing.png';

//     if (status === 'In Progress') {
//       statusColor = '#FF9800'; // Orange
//       statusMessage = 'Your order is now in progress and will be delivered soon.';
//       statusEmoji = '🚚';
//       statusImage = 'delivery.png';
//     } else if (status === 'Delivered') {
//       statusColor = '#4CAF50'; // Green
//       statusMessage = 'Your order has been successfully delivered. Thank you for shopping with us!';
//       statusEmoji = '✅';
//       statusImage = 'delivered.png';
//     } else if (status === 'Failed') {
//       statusColor = '#F44336'; // Red
//       statusMessage = 'We encountered an issue with your delivery. Our team will contact you shortly.';
//       statusEmoji = '⚠️';
//       statusImage = 'failed.png';
//     } else {
//       statusColor = '#2196F3'; // Blue
//       statusMessage = 'Your order status has been updated.';
//       statusEmoji = '📦';
//       statusImage = 'updated.png';
//     }
    
//     // Format order items for the email
//     let itemsHtml = '';
//     if (order.items && order.items.length > 0) {
//       try {
//         // Populate product details if not already populated
//         if (!order.populated('items.productId')) {
//           await order.populate({
//             path: 'items.productId',
//             select: 'productName price image unit'
//           });
//         }
        
//         itemsHtml = order.items.map(item => {
//           // Handle potential undefined values with fallbacks
//           const productId = item.productId || {};
//           const productName = productId.productName || 'Product';
//           const productUnit = productId.unit || 'unit';
//           const productPrice = productId.price || 0;
          
//           const productImage = productId.image 
//             ? `<img src="https://parshuram-dairy-backend.onrender.com/Images/${productId.image}" 
//                   alt="${productName}" 
//                   style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">`
//             : '';
            
//           return `
//             <tr>
//               <td style="padding: 12px; border-bottom: 1px solid #eee; width: 70px;">
//                 ${productImage}
//               </td>
//               <td style="padding: 12px; border-bottom: 1px solid #eee;">
//                 <strong>${productName}</strong>
//               </td>
//               <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
//                 ${item.quantity || 1} ${productUnit}
//               </td>
//               <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
//                 ₹${productPrice.toFixed(2)}
//               </td>
//               <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
//                 ₹${((item.quantity || 1) * productPrice).toFixed(2)}
//               </td>
//             </tr>
//           `;
//         }).join('');
//       } catch (err) {
//         console.error('Error formatting order items:', err);
//         // Fallback if there's an error with item formatting
//         itemsHtml = '<tr><td colspan="5" style="padding: 12px; text-align: center;">Order items details unavailable</td></tr>';
//       }
//     }

//     // Format the delivery address
//     const addressHtml = `
//       <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid ${statusColor};">
//         <h3 style="margin-top: 0; color: #333; font-size: 18px;">Delivery Address:</h3>
//         <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address.street || 'N/A'}</p>
//         <p style="margin: 5px 0;"><strong>City:</strong> ${order.address.city || 'N/A'}</p>
//         <p style="margin: 5px 0;"><strong>State:</strong> ${order.address.state || 'N/A'}</p>
//         <p style="margin: 5px 0;"><strong>Zipcode:</strong> ${order.address.zipcode || 'N/A'}</p>
//       </div>
//     `;

//     const mailOptions = {
//       from: {
//         name: "Parshuram Dairy Farm",
//         address: process.env.EMAIL_USER
//       },
//       to: customer.email,
//       subject: `${statusEmoji} Order #${order._id.toString().slice(-6)} Status Update: ${status}`,
//       html: `
//         <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
//           <div style="text-align: center; margin-bottom: 20px;">
//             <img src="https://parshuram-dairy-backend.onrender.com/Images/logo.png" alt="Parshuram Dairy Logo" style="max-width: 150px; height: auto;">
//           </div>
          
//           <div style="background-color: ${statusColor}; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
//             <h1 style="color: white; margin: 0; font-size: 24px;">Order Status Update: ${status}</h1>
//           </div>
          
//           <div style="padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #fff;">
//             <div style="text-align: center; margin-bottom: 25px;">
//               <div style="font-size: 48px; margin-bottom: 10px;">${statusEmoji}</div>
//               <h2 style="margin: 0; color: ${statusColor}; font-size: 22px;">${status}</h2>
//             </div>
            
//             <p style="font-size: 16px;">Hello ${customer.name},</p>
//             <p style="font-size: 16px;">${statusMessage}</p>
            
//             <div style="margin: 25px 0; padding: 15px; background-color: #f0f8ff; border-radius: 8px; border-left: 4px solid ${statusColor};">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Order Information:</h3>
//               <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
//               <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//               <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
//               ${notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
//             </div>
            
//             ${addressHtml}
            
//             ${itemsHtml ? `
//             <h3 style="margin-top: 30px; color: #333; font-size: 18px;">Order Items:</h3>
//             <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//               <thead>
//                 <tr style="background-color: #f5f5f5;">
//                   <th style="padding: 12px; text-align: left; width: 70px;"></th>
//                   <th style="padding: 12px; text-align: left;">Product</th>
//                   <th style="padding: 12px; text-align: center;">Quantity</th>
//                   <th style="padding: 12px; text-align: right;">Price</th>
//                   <th style="padding: 12px; text-align: right;">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${itemsHtml}
//               </tbody>
//               <tfoot>
//                 <tr style="background-color: #f9f9f9; font-weight: bold;">
//                   <td colspan="4" style="padding: 12px; text-align: right;">Total:</td>
//                   <td style="padding: 12px; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
//                 </tr>
//               </tfoot>
//             </table>
//             ` : ''}
            
//             <div style="margin: 30px 0; text-align: center;">
//               <a href="${process.env.FRONTEND_URL || 'https://parshuram-dairy.com'}/track-order/${order._id}" 
//                  style="display: inline-block; padding: 14px 30px; background-color: ${statusColor}; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
//                 Track Your Order
//               </a>
//             </div>
            
//             <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
//               <h3 style="margin-top: 0; color: #333; font-size: 18px;">Need Help?</h3>
//               <p style="margin-bottom: 15px;">If you have any questions about your order, please contact our customer service:</p>
//               <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:parshuramdairyfarm@gmail.com" style="color: ${statusColor};">parshuramdairyfarm@gmail.com</a></p>
//               <p style="margin: 5px 0;"><strong>Phone:</strong> +91 9876543210</p>
//             </div>
            
//             <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            
//             <div style="text-align: center;">
//               <p style="font-size: 14px; color: #777; margin-bottom: 5px;">
//                 Thank you for choosing Parshuram Dairy!
//               </p>
//               <p style="font-size: 14px; color: #777; margin-bottom: 20px;">
//                 Fresh dairy products delivered to your doorstep.
//               </p>
//               <div style="margin-top: 15px;">
//                 <a href="https://facebook.com/parshuramdairy" style="display: inline-block; margin: 0 10px; color: #4267B2; text-decoration: none;">Facebook</a>
//                 <a href="https://instagram.com/parshuramdairy" style="display: inline-block; margin: 0 10px; color: #E1306C; text-decoration: none;">Instagram</a>
//                 <a href="https://twitter.com/parshuramdairy" style="display: inline-block; margin: 0 10px; color: #1DA1F2; text-decoration: none;">Twitter</a>
//               </div>
//             </div>
//           </div>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Delivery status update email sent to ${customer.email}`);
//     return true;
//   } catch (error) {
//     console.error('Error sending delivery status update email:', error);
//     return false;
//   }
// };
// // Update status via token (for email links)
// const updateStatusViaToken = async (req, res) => {
//   try {
//     const { assignmentId, status, token } = req.params;
    
//     // Find the assignment
//     const assignment = await OrderAssignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ success: false, message: 'Assignment not found' });
//     }
    
//     // Verify token
//     const expectedToken = generateStatusUpdateToken(assignmentId, assignment.deliveryBoyId);
//     if (token !== expectedToken) {
//       return res.status(401).json({ success: false, message: 'Invalid token' });
//     }
    
//     // Update assignment status
//     assignment.status = status;
    
//     // Add to status history
//     assignment.statusHistory = assignment.statusHistory || [];
//     assignment.statusHistory.push({
//       status,
//       timestamp: new Date(),
//       notes: `Status updated to ${status} via email link`
//     });
    
//     await assignment.save();
    
//     // Update order status based on assignment status
//     const order = await Order.findById(assignment.orderId);
//     if (!order) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }
    
//     // Update order status based on assignment status
//     if (status === 'Delivered') {
//       order.status = 'Delivered';
      
//       // Update delivery boy status
//       const deliveryBoy = await DeliveryBoy.findById(assignment.deliveryBoyId);
//       if (deliveryBoy) {
//         const currentOrderIndex = deliveryBoy.currentOrders.indexOf(order._id);
//         if (currentOrderIndex > -1) {
//           deliveryBoy.currentOrders.splice(currentOrderIndex, 1);
//         }
        
//         // Increment total deliveries
//         deliveryBoy.totalDeliveries = (deliveryBoy.totalDeliveries || 0) + 1;
        
//         await deliveryBoy.save();
//       }
//     } else if (status === 'In Progress') {
//       order.status = 'Out for Delivery';
//     } else if (status === 'Failed') {
//       order.status = 'Delivery Failed';
//     }
    
//     await order.save();
    
//     // Send status update email to customer
//     await sendDeliveryStatusUpdateEmail(order, status, `Status updated to ${status}`);
    
//     // Send notification to admin
//     await sendAdminNotificationEmail(order, status, `Status updated to ${status} via email link`);
    
//     // Redirect to a success page
//     res.redirect('/delivery-status-updated.html?status=' + encodeURIComponent(status));
//   } catch (error) {
//     console.error('Error updating status via token:', error);
//     res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
//   }
// };

// // Get all assignments
// const getAllAssignments = async (req, res) => {
//   try {
//     const assignments = await OrderAssignment.find()
//       .populate({
//         path: 'orderId',
//         select: 'items totalAmount paymentMethod address status createdAt'
//       })
//       .populate({
//         path: 'deliveryBoyId',
//         select: 'name email phone'
//       })
//       .sort({ createdAt: -1 });
    
//     res.status(200).json({
//       success: true,
//       count: assignments.length,
//       assignments
//     });
//   } catch (error) {
//     console.error('Error getting assignments:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get assignments',
//       error: error.message
//     });
//   }
// };

// // Get assignment by ID
// // Get assignment by ID
// const getAssignmentById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const assignment = await OrderAssignment.findById(id)
//       .populate({
//         path: 'orderId',
//         select: 'items totalAmount paymentMethod address status createdAt',
//         populate: {
//           path: 'items.productId',
//           select: 'productName price image unit'
//         }
//       })
//       .populate({
//         path: 'deliveryBoyId',
//         select: 'name email phone'
//       });
    
//     if (!assignment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Assignment not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       assignment
//     });
//   } catch (error) {
//     console.error('Error getting assignment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get assignment',
//       error: error.message
//     });
//   }
// };

// // Manually assign delivery boy to an order
// const manuallyAssignDeliveryBoy = async (req, res) => {
//   try {
//     const { orderId, deliveryBoyId, notes } = req.body;
    
//     if (!orderId || !deliveryBoyId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Order ID and Delivery Boy ID are required'
//       });
//     }
    
//     // Check if order exists
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }
    
//     // Check if delivery boy exists
//     const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
//     if (!deliveryBoy) {
//       return res.status(404).json({
//         success: false,
//         message: 'Delivery boy not found'
//       });
//     }
    
//     // Check if order is already assigned
//     const existingAssignment = await OrderAssignment.findOne({ orderId });
//     if (existingAssignment) {
//       return res.status(400).json({
//         success: false,
//         message: 'Order is already assigned to a delivery boy'
//       });
//     }
    
//     // Create assignment
//     const assignment = new OrderAssignment({
//       orderId,
//       deliveryBoyId,
//       status: 'Assigned',
//       notes: notes || 'Manually assigned by admin',
//       statusHistory: [{
//         status: 'Assigned',
//         timestamp: new Date(),
//         notes: notes || 'Manually assigned by admin'
//       }]
//     });
    
//     await assignment.save();
    
//     // Update order status
//     order.status = 'Out for Delivery';
//     await order.save();
    
//     // Update delivery boy's current orders
//     deliveryBoy.currentOrders = deliveryBoy.currentOrders || [];
//     deliveryBoy.currentOrders.push(orderId);
//     await deliveryBoy.save();
    
//     // Populate order details for email
//     await order.populate({
//       path: 'items.productId',
//       select: 'productName price image unit'
//     });
    
//     // Send email to delivery boy
//     await sendDeliveryAssignmentEmail(deliveryBoy, order, assignment);
    
//     // Send notification to admin
//     await sendAdminNotificationEmail(
//       order, 
//       'Assigned', 
//       `Order manually assigned to delivery boy ${deliveryBoy.name}`,
//       deliveryBoy
//     );
    
//     res.status(201).json({
//       success: true,
//       message: 'Order assigned successfully',
//       assignment
//     });
//   } catch (error) {
//     console.error('Error assigning delivery boy:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to assign delivery boy',
//       error: error.message
//     });
//   }
// };

// // Function to send notification to admin about status updates
// const sendAdminNotificationEmail = async (order, status, notes, deliveryBoy = null) => {
//   try {
//     // Skip if admin email is not configured
//     if (!process.env.ADMIN_EMAIL) {
//       console.log('Admin email not configured, skipping notification');
//       return false;
//     }
    
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });
    
//     // Get customer details
//     const customer = await User.findById(order.userId);
    
//     // Get assignment if not provided
//     let assignment = null;
//     if (!deliveryBoy) {
//       assignment = await OrderAssignment.findOne({ orderId: order._id });
//       if (assignment) {
//         deliveryBoy = await DeliveryBoy.findById(assignment.deliveryBoyId);
//       }
//     }
    
//     // Status color based on status
//     let statusColor;
//     switch(status) {
//       case 'In Progress':
//         statusColor = '#ff9800'; // Orange
//         break;
//       case 'Delivered':
//         statusColor = '#4CAF50'; // Green
//         break;
//       case 'Failed':
//         statusColor = '#f44336'; // Red
//         break;
//       case 'Assigned':
//         statusColor = '#2196F3'; // Blue
//         break;
//       default:
//         statusColor = '#2196F3'; // Blue
//     }
    
//     // Format the order items for email
//     const itemsHtml = order.items.map(item => {
//       const productName = item.productId.productName || 'Product';
//       const price = item.productId.price || item.price || 0;
//       const quantity = item.quantity || 1;
      
//       return `
//         <tr>
//           <td style="padding: 10px; border-bottom: 1px solid #eee;">
//             <strong>${productName}</strong>
//           </td>
//           <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
//             ${quantity}
//           </td>
//           <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
//             ₹${price}
//           </td>
//         </tr>
//       `;
//     }).join('');
    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: process.env.ADMIN_EMAIL,
//       subject: `Order Status Update: #${order._id.toString().slice(-6)} - ${status}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
//           <div style="background-color: ${statusColor}; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
//             <h1 style="color: white; margin: 0;">Order Status Update</h1>
//           </div>
          
//           <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
//             <p>Hello Admin,</p>
//             <p>An order status has been updated to <strong>${status}</strong>. Here are the details:</p>
            
//             <div style="margin: 20px 0; padding: 15px; background-color: #f0f8ff; border-radius: 5px;">
//               <h3 style="margin-top: 0; color: #333;">Order Information:</h3>
//               <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
//               <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
//               <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
//               <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
//               ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
//             </div>
            
//             <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
//               <h3 style="margin-top: 0; color: #333;">Customer Information:</h3>
//               <p><strong>Name:</strong> ${customer ? customer.name : 'N/A'}</p>
//               <p><strong>Email:</strong> ${customer ? customer.email : 'N/A'}</p>
//               <p><strong>Phone:</strong> ${customer ? customer.phone : 'N/A'}</p>
//               <p><strong>Address:</strong> ${order.address.street || 'N/A'}</p>
//               <p><strong>City:</strong> ${order.address.city || 'N/A'}, ${order.address.state || 'N/A'} ${order.address.zipcode || 'N/A'}</p>
//             </div>
            
//             ${deliveryBoy ? `
//             <div style="margin: 20px 0; padding: 15px; background-color: #f0f8ff; border-radius: 5px;">
//               <h3 style="margin-top: 0; color: #333;">Delivery Boy Information:</h3>
//               <p><strong>Name:</strong> ${deliveryBoy.name || 'N/A'}</p>
//               <p><strong>Email:</strong> ${deliveryBoy.email || 'N/A'}</p>
//               <p><strong>Phone:</strong> ${deliveryBoy.phone || 'N/A'}</p>
//             </div>
//             ` : ''}
            
//             <h3 style="margin-top: 30px; color: #333;">Order Items:</h3>
//             <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//               <thead>
//                 <tr style="background-color: #f5f5f5;">
//                   <th style="padding: 10px; text-align: left;">Product</th>
//                   <th style="padding: 10px; text-align: center;">Quantity</th>
//                   <th style="padding: 10px; text-align: right;">Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${itemsHtml}
//               </tbody>
//               <tfoot>
//                 <tr style="background-color: #f9f9f9; font-weight: bold;">
//                   <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
//                   <td style="padding: 10px; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
//                 </tr>
//               </tfoot>
//             </table>
            
//             <div style="margin-top: 30px; text-align: center;">
//               <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000/admin'}/orders/${order._id}" 
//                  style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
//                 View Order Details
//               </a>
//             </div>
            
//             <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            
//             <p style="font-size: 14px; color: #777; text-align: center;">
//               This is an automated notification from Parshuram Dairy Management System.
//             </p>
//           </div>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Dairy order notification email sent to admin successfully`);
//     return true;
//   } catch (error) {
//     console.error('Error sending admin notification email:', error);
//     return false;
//   }
// };

// module.exports = {
//   createAssignment,
//   getAssignmentById,
//   updateAssignmentStatus,
//   deleteAssignment,
//   getAssignmentsByDeliveryBoy,
//   getAssignmentsByOrder,
//   getAllAssignments,
//   sendDeliveryAssignmentEmail,
//   sendAdminNotificationEmail,
//   updateStatusViaToken,
//   sendDeliveryStatusUpdateEmail,
//   generateStatusUpdateToken,
//   manuallyAssignDeliveryBoy
// };
   




const User = require('../models/User');
const Order = require('../models/Order');
const DeliveryBoy = require('../models/DeliveryBoy');
const OrderAssignment = require('../models/OrderAssignment');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Generate a secure token for status updates via email
const generateStatusUpdateToken = (assignmentId, deliveryBoyId) => {
  // In a real app, use a proper JWT or other secure token method
  // This is a simplified version for demonstration
  const data = `${assignmentId}:${deliveryBoyId}:${process.env.JWT_SECRET || 'parshuram-dairy-secret'}`;
  return require('crypto').createHash('sha256').update(data).digest('hex');
};

// Helper function to send email to delivery boy
// Helper function to send email to delivery boy
const sendDeliveryAssignmentEmail = async (deliveryBoy, order, assignment) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add these settings to reduce spam likelihood
      tls: {
        rejectUnauthorized: false
      },
      secure: true
    });

    // Get customer details
    const customer = await User.findById(order.userId);
    
    // Format the order items for email with error handling
    const itemsHtml = order.items.map(item => {
      // Handle potential undefined values with fallbacks
      const productId = item.productId || {};
      const productName = productId.productName || 'Product';
      const productUnit = productId.unit || 'unit';
      const productPrice = productId.price || 0;
      
      const productImage = productId.image 
        ? `<img src="https://parshuram-dairy-backend.onrender.com/Images/${productId.image}" 
               alt="${productName}" 
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">`
        : '';
        
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; width: 70px;">
            ${productImage}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${productName}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity || 1} 
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${productPrice.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${((item.quantity || 1) * productPrice).toFixed(2)}
          </td>
        </tr>
      `;
    }).join('');

    // Format the delivery address
    const addressHtml = `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #4CAF50;">
        <h3 style="margin-top: 0; color: #333; font-size: 18px;">Delivery Address:</h3>
        <p style="margin: 5px 0;"><strong>Customer:</strong> ${customer ? customer.name : 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer ? customer.phone : 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address.street || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>City:</strong> ${order.address.city || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>State:</strong> ${order.address.state || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Zipcode:</strong> ${order.address.zipcode || 'N/A'}</p>
      </div>
    `;

    // Generate status update tokens
    const inProgressToken = generateStatusUpdateToken(assignment._id, deliveryBoy._id);
    const deliveredToken = generateStatusUpdateToken(assignment._id, deliveryBoy._id);
    const failedToken = generateStatusUpdateToken(assignment._id, deliveryBoy._id);

    // Create status update links - use production URL if available
    const baseUrl = process.env.BACKEND_URL || 'https://parshuram-dairy-backend.onrender.com';
    const inProgressLink = `${baseUrl}/api/delivery/update-status/${assignment._id}/In%20Progress/${inProgressToken}`;
    const deliveredLink = `${baseUrl}/api/delivery/update-status/${assignment._id}/Delivered/${deliveredToken}`;
    const failedLink = `${baseUrl}/api/delivery/update-status/${assignment._id}/Failed/${failedToken}`;

    const mailOptions = {
      from: {
        name: "Parshuram Dairy Farm",
        address: process.env.EMAIL_USER
      },
      to: deliveryBoy.email,
      subject: `New Delivery Assignment - Order #${order._id.toString().slice(-6)}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://parshuram-dairy-backend.onrender.com/Images/logo.png" alt="Parshuram Dairy Logo" style="max-width: 150px; height: auto;">
          </div>
          
          <div style="background-color: #4CAF50; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Delivery Assignment</h1>
          </div>
          
          <div style="padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #fff;">
            <p style="font-size: 16px;">Hello ${deliveryBoy.name},</p>
            <p style="font-size: 16px;">You have been assigned a new order for delivery. Please find the details below:</p>
            
            <div style="margin: 25px 0; padding: 15px; background-color: #f0f8ff; border-radius: 8px; border-left: 4px solid #4CAF50;">
              <h3 style="margin-top: 0; color: #333; font-size: 18px;">Order Information:</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">${assignment.status}</span></p>
            </div>
            
            ${addressHtml}
            
            <h3 style="margin-top: 30px; color: #333; font-size: 18px;">Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; width: 70px;"></th>
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: center;">Items</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                  <th style="padding: 12px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td colspan="4" style="padding: 12px; text-align: right;">Total:</td>
                  <td style="padding: 12px; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="margin-top: 30px; text-align: center;">
              <p style="margin-bottom: 15px; font-weight: bold; font-size: 16px;">Update Delivery Status:</p>
              <a href="${inProgressLink}" 
                 style="display: inline-block; margin: 0 5px 10px 5px; padding: 12px 20px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                In Progress
              </a>
              <a href="${deliveredLink}" 
                 style="display: inline-block; margin: 0 5px 10px 5px; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                Delivered
              </a>
              <a href="${failedLink}" 
                 style="display: inline-block; margin: 0 5px 10px 5px; padding: 12px 20px; background-color: #F44336; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                Failed
              </a>
            </div>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
              <h3 style="margin-top: 0; color: #333; font-size: 18px;">Need Help?</h3>
              <p style="margin-bottom: 15px;">If you have any questions about this delivery, please contact us:</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:parshuramdairyfarm@gmail.com" style="color: #4CAF50;">parshuramdairyfarm@gmail.com</a></p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> +91 9876543210</p>
            </div>
            
            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            
            <p style="font-size: 14px; color: #777; text-align: center;">
              Thank you for your service with Parshuram Dairy Farm!
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Delivery assignment email sent to ${deliveryBoy.email}`);
    return true;
  } catch (error) {
    console.error('Error sending delivery assignment email:', error);
    return false;
  }
};

// Create a new assignment
const createAssignment = async (req, res) => {
  try {
    const { orderId, deliveryBoyId, status, notes } = req.body;
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if delivery boy exists
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }
    
    // Check if order is already assigned
    const existingAssignment = await OrderAssignment.findOne({ orderId });
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Order is already assigned to a delivery boy'
      });
    }
    
    // Create assignment
    const assignment = new OrderAssignment({
      orderId,
      deliveryBoyId,
      status: status || 'Assigned',
      notes: notes || 'Assignment created',
      statusHistory: [{
        status: status || 'Assigned',
        timestamp: new Date(),
        notes: notes || 'Assignment created'
      }]
    });
    
    await assignment.save();
    
    // Update order status
    order.status = 'Out for Delivery';
    await order.save();
    
    // Update delivery boy's current orders
    deliveryBoy.currentOrders.push(orderId);
    await deliveryBoy.save();
    
    // Populate order details for email
    await order.populate({
      path: 'items.productId',
      select: 'productName price image unit'
    });
    
    // Send email to delivery boy
    await sendDeliveryAssignmentEmail(deliveryBoy, order, assignment);
    
    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
};

// Delete an assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await OrderAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Update order status back to pending
    const order = await Order.findById(assignment.orderId);
    if (order) {
      order.status = 'Pending';
      await order.save();
    }
    
    // Remove order from delivery boy's current orders
    const deliveryBoy = await DeliveryBoy.findById(assignment.deliveryBoyId);
    if (deliveryBoy) {
      const orderIndex = deliveryBoy.currentOrders.indexOf(assignment.orderId);
      if (orderIndex > -1) {
        deliveryBoy.currentOrders.splice(orderIndex, 1);
        await deliveryBoy.save();
      }
    }
    
    // Delete the assignment
    await OrderAssignment.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};

// Get assignments by delivery boy
const getAssignmentsByDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    
    // Validate delivery boy exists
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }
    
    // Get assignments for this delivery boy
    const assignments = await OrderAssignment.find({ deliveryBoyId })
      .populate({
        path: 'orderId',
        select: 'items totalAmount paymentMethod address status createdAt',
        populate: {
          path: 'items.productId',
          select: 'productName price image unit'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Error getting assignments by delivery boy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignments',
      error: error.message
    });
  }
};

// Get assignments by order
const getAssignmentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get assignments for this order
    const assignments = await OrderAssignment.find({ orderId })
      .populate({
        path: 'deliveryBoyId',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Error getting assignments by order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignments',
      error: error.message
    });
  }
};

// Update assignment status
const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, notes } = req.body;
    
    // Find the assignment
    const assignment = await OrderAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    // Update assignment status
    assignment.status = status;
    if (notes) {
      assignment.notes = notes;
    }
    
    // Add to status history
    assignment.statusHistory = assignment.statusHistory || [];
    assignment.statusHistory.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`
    });
    
    await assignment.save();
    
    // Update order status based on assignment status
    const order = await Order.findById(assignment.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Update order status based on assignment status
    if (status === 'Delivered') {
      order.status = 'Delivered';
      
      // Update delivery boy status
      const deliveryBoy = await DeliveryBoy.findById(assignment.deliveryBoyId);
      if (deliveryBoy) {
        const currentOrderIndex = deliveryBoy.currentOrders.indexOf(order._id);
        if (currentOrderIndex > -1) {
          deliveryBoy.currentOrders.splice(currentOrderIndex, 1);
        }
        
        // Increment total deliveries
        deliveryBoy.totalDeliveries = (deliveryBoy.totalDeliveries || 0) + 1;
        
        await deliveryBoy.save();
      }
    } else if (status === 'In Progress') {
      order.status = 'Out for Delivery';
    } else if (status === 'Failed') {
      order.status = 'Delivery Failed';
    }
    
    await order.save();
    
    // Send status update email to customer
    await sendDeliveryStatusUpdateEmail(order, status, notes);
    
    res.json({ success: true, message: 'Status updated successfully', assignment });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

// Helper function to send delivery status update email to customer
// Helper function to send delivery status update email to customer
const sendDeliveryStatusUpdateEmail = async (order, status, notes) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add these settings to reduce spam likelihood
      tls: {
        rejectUnauthorized: false
      },
      secure: true
    });

    // Get customer details
    const customer = await User.findById(order.userId);
    if (!customer || !customer.email) {
      console.log('Customer email not found, skipping status update email');
      return false;
    }

    // Set status color, message, and emoji based on status
    let statusColor = '#4CAF50'; // Default green
    let statusMessage = 'Your order is being processed.';
    let statusEmoji = '🔄';
    let statusImage = 'processing.png';

    if (status === 'In Progress') {
      statusColor = '#FF9800'; // Orange
      statusMessage = 'Your order is now in progress and will be delivered soon.';
      statusEmoji = '🚚';
      statusImage = 'delivery.png';
    } else if (status === 'Delivered') {
      statusColor = '#4CAF50'; // Green
      statusMessage = 'Your order has been successfully delivered. Thank you for shopping with us!';
      statusEmoji = '✅';
      statusImage = 'delivered.png';
    } else if (status === 'Failed') {
      statusColor = '#F44336'; // Red
      statusMessage = 'We encountered an issue with your delivery. Our team will contact you shortly.';
      statusEmoji = '⚠️';
      statusImage = 'failed.png';
    } else {
      statusColor = '#2196F3'; // Blue
      statusMessage = 'Your order status has been updated.';
      statusEmoji = '📦';
      statusImage = 'updated.png';
    }
    
    // Format order items for the email
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
      try {
        // Populate product details if not already populated
        if (!order.populated('items.productId')) {
          await order.populate({
            path: 'items.productId',
            select: 'productName price image unit'
          });
        }
        
        itemsHtml = order.items.map(item => {
          // Handle potential undefined values with fallbacks
          const productId = item.productId || {};
          const productName = productId.productName || 'Product';
          const productUnit = productId.unit || 'unit';
          const productPrice = productId.price || 0;
          
          const productImage = productId.image 
            ? `<img src="https://parshuram-dairy-backend.onrender.com/Images/${productId.image}" 
                  alt="${productName}" 
                  style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">`
            : '';
            
          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; width: 70px;">
                ${productImage}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <strong>${productName}</strong>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                ${item.quantity || 1}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                ₹${productPrice.toFixed(2)}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                ₹${((item.quantity || 1) * productPrice).toFixed(2)}
              </td>
            </tr>
          `;
        }).join('');
      } catch (err) {
        console.error('Error formatting order items:', err);
        // Fallback if there's an error with item formatting
        itemsHtml = '<tr><td colspan="5" style="padding: 12px; text-align: center;">Order items details unavailable</td></tr>';
      }
    }

    // Format the delivery address
    const addressHtml = `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid ${statusColor};">
        <h3 style="margin-top: 0; color: #333; font-size: 18px;">Delivery Address:</h3>
        <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address.street || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>City:</strong> ${order.address.city || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>State:</strong> ${order.address.state || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Zipcode:</strong> ${order.address.zipcode || 'N/A'}</p>
      </div>
    `;

    const mailOptions = {
      from: {
        name: "Parshuram Dairy Farm",
        address: process.env.EMAIL_USER
      },
      to: customer.email,
      subject: `${statusEmoji} Order #${order._id.toString().slice(-6)} Status Update: ${status}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://parshuram-dairy-backend.onrender.com/Images/logo.png" alt="Parshuram Dairy Logo" style="max-width: 150px; height: auto;">
          </div>
          
          <div style="background-color: ${statusColor}; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Order Status Update: ${status}</h1>
          </div>
          
          <div style="padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; background-color: #fff;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 10px;">${statusEmoji}</div>
              <h2 style="margin: 0; color: ${statusColor}; font-size: 22px;">${status}</h2>
            </div>
            
            <p style="font-size: 16px;">Hello ${customer.name},</p>
            <p style="font-size: 16px;">${statusMessage}</p>
            
            <div style="margin: 25px 0; padding: 15px; background-color: #f0f8ff; border-radius: 8px; border-left: 4px solid ${statusColor};">
              <h3 style="margin-top: 0; color: #333; font-size: 18px;">Order Information:</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
              ${notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            ${addressHtml}
            
            ${itemsHtml ? `
            <h3 style="margin-top: 30px; color: #333; font-size: 18px;">Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; width: 70px;"></th>
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: center;">Items</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                  <th style="padding: 12px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td colspan="4" style="padding: 12px; text-align: right;">Total:</td>
                  <td style="padding: 12px; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            ` : ''}
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://parshuram-dairy.com'}/track-order/${order._id}" 
                 style="display: inline-block; padding: 14px 30px; background-color: ${statusColor}; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                Track Your Order
              </a>
            </div>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
              <h3 style="margin-top: 0; color: #333; font-size: 18px;">Need Help?</h3>
              <p style="margin-bottom: 15px;">If you have any questions about your order, please contact our customer service:</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:parshuramdairyfarm@gmail.com" style="color: ${statusColor};">parshuramdairyfarm@gmail.com</a></p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> +91 9876543210</p>
            </div>
            
            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            
            <div style="text-align: center;">
              <p style="font-size: 14px; color: #777; margin-bottom: 5px;">
                Thank yoF for choosing Parshuram Dairy Farm!
              </p>
              <p style="font-size: 14px; color: #777; margin-bottom: 20px;">
                Fresh dairy products delivered to your doorstep.
              </p>
              <div style="margin-top: 15px;">
                <a href="https://facebook.com/parshuramdairy" style="display: inline-block; margin: 0 10px; color: #4267B2; text-decoration: none;">Facebook</a>
                <a href="https://instagram.com/parshuramdairy" style="display: inline-block; margin: 0 10px; color: #E1306C; text-decoration: none;">Instagram</a>
                <a href="https://twitter.com/parshuramdairy" style="display: inline-block; margin: 0 10px; color: #1DA1F2; text-decoration: none;">Twitter</a>
              </div>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Delivery status update email sent to ${customer.email}`);
    return true;
  } catch (error) {
    console.error('Error sending delivery status update email:', error);
    return false;
  }
};
// Update status via token (for email links)
const updateStatusViaToken = async (req, res) => {
  try {
    const { assignmentId, status, token } = req.params;
    
    // Find the assignment
    const assignment = await OrderAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    // Verify token
    const expectedToken = generateStatusUpdateToken(assignmentId, assignment.deliveryBoyId);
    if (token !== expectedToken) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    // Update assignment status
    assignment.status = status;
    
    // Add to status history
    assignment.statusHistory = assignment.statusHistory || [];
    assignment.statusHistory.push({
      status,
      timestamp: new Date(),
      notes: `Status updated to ${status} via email link`
    });
    
    await assignment.save();
    
    // Update order status based on assignment status
    const order = await Order.findById(assignment.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Update order status based on assignment status
    if (status === 'Delivered') {
      order.status = 'Delivered';
      
      // Update delivery boy status
      const deliveryBoy = await DeliveryBoy.findById(assignment.deliveryBoyId);
      if (deliveryBoy) {
        const currentOrderIndex = deliveryBoy.currentOrders.indexOf(order._id);
        if (currentOrderIndex > -1) {
          deliveryBoy.currentOrders.splice(currentOrderIndex, 1);
        }
        
        // Increment total deliveries
        deliveryBoy.totalDeliveries = (deliveryBoy.totalDeliveries || 0) + 1;
        
        await deliveryBoy.save();
      }
    } else if (status === 'In Progress') {
      order.status = 'Out for Delivery';
    } else if (status === 'Failed') {
      order.status = 'Delivery Failed';
    }
    
    await order.save();
    
    // Send status update email to customer
    await sendDeliveryStatusUpdateEmail(order, status, `Status updated to ${status}`);
    
    // Send notification to admin
    await sendAdminNotificationEmail(order, status, `Status updated to ${status} via email link`);
    
    // Redirect to a success page
    res.redirect('/delivery-status-updated.html?status=' + encodeURIComponent(status));
  } catch (error) {
    console.error('Error updating status via token:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

// Get all assignments
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await OrderAssignment.find()
      .populate({
        path: 'orderId',
        select: 'items totalAmount paymentMethod address status createdAt'
      })
      .populate({
        path: 'deliveryBoyId',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Error getting assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignments',
      error: error.message
    });
  }
};

// Get assignment by ID
// Get assignment by ID
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await OrderAssignment.findById(id)
      .populate({
        path: 'orderId',
        select: 'items totalAmount paymentMethod address status createdAt',
        populate: {
          path: 'items.productId',
          select: 'productName price image unit'
        }
      })
      .populate({
        path: 'deliveryBoyId',
        select: 'name email phone'
      });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Error getting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignment',
      error: error.message
    });
  }
};

// Manually assign delivery boy to an order
const manuallyAssignDeliveryBoy = async (req, res) => {
  try {
    const { orderId, deliveryBoyId, notes } = req.body;
    
    if (!orderId || !deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and Delivery Boy ID are required'
      });
    }
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if delivery boy exists
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }
    
    // Check if order is already assigned
    const existingAssignment = await OrderAssignment.findOne({ orderId });
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Order is already assigned to a delivery boy'
      });
    }
    
    // Create assignment
    const assignment = new OrderAssignment({
      orderId,
      deliveryBoyId,
      status: 'Assigned',
      notes: notes || 'Manually assigned by admin',
      statusHistory: [{
        status: 'Assigned',
        timestamp: new Date(),
        notes: notes || 'Manually assigned by admin'
      }]
    });
    
    await assignment.save();
    
    // Update order status
    order.status = 'Out for Delivery';
    await order.save();
    
    // Update delivery boy's current orders
    deliveryBoy.currentOrders = deliveryBoy.currentOrders || [];
    deliveryBoy.currentOrders.push(orderId);
    await deliveryBoy.save();
    
    // Populate order details for email
    await order.populate({
      path: 'items.productId',
      select: 'productName price image unit'
    });
    
    // Send email to delivery boy
    await sendDeliveryAssignmentEmail(deliveryBoy, order, assignment);
    
    // Send notification to admin
    await sendAdminNotificationEmail(
      order, 
      'Assigned', 
      `Order manually assigned to delivery boy ${deliveryBoy.name}`,
      deliveryBoy
    );
    
    res.status(201).json({
      success: true,
      message: 'Order assigned successfully',
      assignment
    });
  } catch (error) {
    console.error('Error assigning delivery boy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign delivery boy',
      error: error.message
    });
  }
};

// Function to send notification to admin about status updates
const sendAdminNotificationEmail = async (order, status, notes, deliveryBoy = null) => {
  try {
    // Skip if admin email is not configured
    if (!process.env.ADMIN_EMAIL) {
      console.log('Admin email not configured, skipping notification');
      return false;
    }
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Get customer details
    const customer = await User.findById(order.userId);
    
    // Get assignment if not provided
    let assignment = null;
    if (!deliveryBoy) {
      assignment = await OrderAssignment.findOne({ orderId: order._id });
      if (assignment) {
        deliveryBoy = await DeliveryBoy.findById(assignment.deliveryBoyId);
      }
    }
    
    // Status color based on status
    let statusColor;
    switch(status) {
      case 'In Progress':
        statusColor = '#ff9800'; // Orange
        break;
      case 'Delivered':
        statusColor = '#4CAF50'; // Green
        break;
      case 'Failed':
        statusColor = '#f44336'; // Red
        break;
      case 'Assigned':
        statusColor = '#2196F3'; // Blue
        break;
      default:
        statusColor = '#2196F3'; // Blue
    }
    
    // Format the order items for email
    const itemsHtml = order.items.map(item => {
      const productName = item.productId.productName || 'Product';
      const price = item.productId.price || item.price || 0;
      const quantity = item.quantity || 1;
      
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${productName}</strong>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${price}
          </td>
        </tr>
      `;
    }).join('');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Order Status Update: #${order._id.toString().slice(-6)} - ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background-color: ${statusColor}; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="color: white; margin: 0;">Order Status Update</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Hello Admin,</p>
            <p>An order status has been updated to <strong>${status}</strong>. Here are the details:</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f0f8ff; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #333;">Order Information:</h3>
              <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #333;">Customer Information:</h3>
              <p><strong>Name:</strong> ${customer ? customer.name : 'N/A'}</p>
              <p><strong>Email:</strong> ${customer ? customer.email : 'N/A'}</p>
              <p><strong>Phone:</strong> ${customer ? customer.phone : 'N/A'}</p>
              <p><strong>Address:</strong> ${order.address.street || 'N/A'}</p>
              <p><strong>City:</strong> ${order.address.city || 'N/A'}, ${order.address.state || 'N/A'} ${order.address.zipcode || 'N/A'}</p>
            </div>
            
            ${deliveryBoy ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #f0f8ff; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #333;">Delivery Boy Information:</h3>
              <p><strong>Name:</strong> ${deliveryBoy.name || 'N/A'}</p>
              <p><strong>Email:</strong> ${deliveryBoy.email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${deliveryBoy.phone || 'N/A'}</p>
            </div>
            ` : ''}
            
            <h3 style="margin-top: 30px; color: #333;">Order Items:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Items</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
                  <td style="padding: 10px; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000/admin'}/orders/${order._id}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Order Details
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            
            <p style="font-size: 14px; color: #777; text-align: center;">
              This is an automated notification from Parshuram Dairy Farm Management System.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Dairy order notification email sent to admin successfully`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
};

module.exports = {
  createAssignment,
  getAssignmentById,
  updateAssignmentStatus,
  deleteAssignment,
  getAssignmentsByDeliveryBoy,
  getAssignmentsByOrder,
  getAllAssignments,
  sendDeliveryAssignmentEmail,
  sendAdminNotificationEmail,
  updateStatusViaToken,
  sendDeliveryStatusUpdateEmail,
  generateStatusUpdateToken,
  manuallyAssignDeliveryBoy
};
   