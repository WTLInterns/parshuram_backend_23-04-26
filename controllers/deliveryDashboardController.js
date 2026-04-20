// const DeliveryBoy = require('../models/DeliveryBoy');
// const OrderAssignment = require('../models/OrderAssignment');
// const Order = require('../models/Order');

// // Get dashboard stats for a delivery boy
// const getDeliveryDashboard = async (req, res) => {
//   try {
//     // Ensure the user is a delivery boy
//     if (req.user.role !== 'DeliveryBoy') {
//       return res.status(403).json({ message: 'Not authorized as delivery boy' });
//     }

//     // Find the delivery boy record by email
//     const deliveryBoy = await DeliveryBoy.findOne({ email: req.user.email });
//     if (!deliveryBoy) {
//       return res.status(404).json({ message: 'Delivery boy profile not found' });
//     }

//     // Get all assignments for this delivery boy
//     const allAssignments = await OrderAssignment.find({ deliveryBoyId: deliveryBoy._id });
    
//     // Get today's assignments
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const todayAssignments = allAssignments.filter(assignment => {
//       const assignmentDate = new Date(assignment.createdAt);
//       assignmentDate.setHours(0, 0, 0, 0);
//       return assignmentDate.getTime() === today.getTime();
//     });

//     // Get assignments by status
//     const pendingAssignments = allAssignments.filter(a => a.status === 'Assigned');
//     const inProgressAssignments = allAssignments.filter(a => a.status === 'In Progress');
//     const deliveredAssignments = allAssignments.filter(a => a.status === 'Delivered');
//     const failedAssignments = allAssignments.filter(a => a.status === 'Failed');

//     // Calculate earnings (if you have payment info in your orders)
//     // This is a placeholder - adjust based on your actual data model
//     let totalEarnings = 0;
//     let todayEarnings = 0;

//     // Return dashboard data
//     res.status(200).json({
//       deliveryBoy: {
//         id: deliveryBoy._id,
//         name: deliveryBoy.name,
//         isAvailable: deliveryBoy.isAvailable,
//         maxOrdersPerDay: deliveryBoy.maxOrdersPerDay,
//         currentOrderCount: deliveryBoy.currentOrders.length
//       },
//       stats: {
//         totalAssignments: allAssignments.length,
//         todayAssignments: todayAssignments.length,
//         pendingCount: pendingAssignments.length,
//         inProgressCount: inProgressAssignments.length,
//         deliveredCount: deliveredAssignments.length,
//         failedCount: failedAssignments.length,
//         totalEarnings,
//         todayEarnings
//       },
//       recentAssignments: await OrderAssignment.find({ deliveryBoyId: deliveryBoy._id })
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .populate({
//           path: 'orderId',
//           populate: {
//             path: 'userId',
//             select: 'name'
//           }
//         })
//     });
//   } catch (error) {
//     console.error('Error fetching delivery dashboard:', error);
//     res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
//   }
// };

// module.exports = {
//   getDeliveryDashboard
// };




const DeliveryBoy = require('../models/DeliveryBoy');
const OrderAssignment = require('../models/OrderAssignment');
const Order = require('../models/Order');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Get dashboard stats for a delivery boy
const getDeliveryDashboard = async (req, res) => {
  try {
    // Ensure the user is a delivery boy
    if (req.user.role !== 'DeliveryBoy') {
      return res.status(403).json({ message: 'Not authorized as delivery boy' });
    }

    // Find the delivery boy record by email
    const deliveryBoy = await DeliveryBoy.findOne({ email: req.user.email });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    // Get all assignments for this delivery boy
    const allAssignments = await OrderAssignment.find({ deliveryBoyId: deliveryBoy._id });
    
    // Get today's assignments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAssignments = allAssignments.filter(assignment => {
      const assignmentDate = new Date(assignment.createdAt);
      assignmentDate.setHours(0, 0, 0, 0);
      return assignmentDate.getTime() === today.getTime();
    });

    // Get assignments by status
    const pendingAssignments = allAssignments.filter(a => a.status === 'Assigned');
    const inProgressAssignments = allAssignments.filter(a => a.status === 'In Progress');
    const deliveredAssignments = allAssignments.filter(a => a.status === 'Delivered');
    const failedAssignments = allAssignments.filter(a => a.status === 'Failed');

    // Calculate earnings (if you have payment info in your orders)
    // This is a placeholder - adjust based on your actual data model
    let totalEarnings = 0;
    let todayEarnings = 0;

    // Get recent assignments with more details
    const recentAssignments = await OrderAssignment.find({ deliveryBoyId: deliveryBoy._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'orderId',
        select: 'userId items totalAmount address status createdAt',
        populate: [
          {
            path: 'userId',
            select: 'name email phone'
          },
          {
            path: 'items.productId',
            select: 'productName price image unit category subCategory productDescription'
          }
        ]
      });

    // Format recent assignments for easier frontend consumption with detailed product info
    const formattedRecentAssignments = recentAssignments.map(assignment => {
      const order = assignment.orderId;
      
      // Format items with detailed product information
      const formattedItems = order.items.map(item => {
        const product = item.productId || {};
        return {
          productId: product._id || null,
          productName: product.productName || 'Product',
          price: product.price || 0,
          quantity: item.quantity || 0,
          unit: product.unit || 'unit',
          image: product.image || null,
          category: product.category || 'Uncategorized',
          subCategory: product.subCategory || '',
          description: product.productDescription || '',
          totalPrice: (item.quantity || 0) * (product.price || 0)
        };
      });
      
      return {
        assignmentId: assignment._id,
        orderId: order._id,
        status: assignment.status,
        createdAt: assignment.createdAt,
        customer: order.userId ? {
          name: order.userId.name,
          phone: order.userId.phone,
          email: order.userId.email
        } : null,
        address: order.address,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        items: formattedItems
      };
    });

    // Return dashboard data
    res.status(200).json({
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        isAvailable: deliveryBoy.isAvailable,
        maxOrdersPerDay: deliveryBoy.maxOrdersPerDay,
        currentOrderCount: deliveryBoy.currentOrders.length,
        pincodes: deliveryBoy.pincodes || []
      },
      stats: {
        totalAssignments: allAssignments.length,
        todayAssignments: todayAssignments.length,
        pendingCount: pendingAssignments.length,
        inProgressCount: inProgressAssignments.length,
        deliveredCount: deliveredAssignments.length,
        failedCount: failedAssignments.length,
        totalEarnings,
        todayEarnings
      },
      recentAssignments: formattedRecentAssignments
    });
  } catch (error) {
    console.error('Error fetching delivery dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
};

// Get current assignments for delivery boy
const getCurrentAssignments = async (req, res) => {
  try {
    // Find the delivery boy record by email
    const deliveryBoy = await DeliveryBoy.findOne({ email: req.user.email });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    // Get active assignments (Assigned or In Progress)
    const activeAssignments = await OrderAssignment.find({
      deliveryBoyId: deliveryBoy._id,
      status: { $in: ['Assigned', 'In Progress'] }
    }).populate({
      path: 'orderId',
      select: 'userId items totalAmount address status createdAt paymentMethod',
      populate: [
        {
          path: 'userId',
          select: 'name email phone'
        },
        {
          path: 'items.productId',
          select: 'productName price image unit category subCategory productDescription nutritionalInfo availableStock'
        }
      ]
    }).sort({ createdAt: -1 });

    // Format assignments for easier frontend consumption with enhanced product details
    const formattedAssignments = activeAssignments.map(assignment => {
      const order = assignment.orderId;
      return {
        assignmentId: assignment._id,
        orderId: order._id,
        status: assignment.status,
        createdAt: assignment.createdAt,
        customer: order.userId ? {
          name: order.userId.name,
          phone: order.userId.phone,
          email: order.userId.email
        } : null,
        address: order.address,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        items: order.items.map(item => {
          const product = item.productId || {};
          return {
            productId: product._id || null,
            productName: product.productName || 'Product',
            quantity: item.quantity || 0,
            price: product.price || 0,
            image: product.image || null,
            unit: product.unit || 'unit',
            category: product.category || 'Uncategorized',
            subCategory: product.subCategory || '',
            description: product.productDescription || '',
            nutritionalInfo: product.nutritionalInfo || '',
            totalPrice: (item.quantity || 0) * (product.price || 0)
          };
        })
      };
    });

    res.status(200).json({
      count: formattedAssignments.length,
      assignments: formattedAssignments
    });
  } catch (error) {
    console.error('Error fetching current assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// Get detailed information about a specific assignment
const getAssignmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the delivery boy record by email
    const deliveryBoy = await DeliveryBoy.findOne({ email: req.user.email });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }
    
    // Get the assignment with detailed information
    const assignment = await OrderAssignment.findOne({
      _id: id,
      deliveryBoyId: deliveryBoy._id
    }).populate({
      path: 'orderId',
      select: 'userId items totalAmount address status createdAt paymentMethod',
      populate: [
        {
          path: 'userId',
          select: 'name email phone'
        },
        {
          path: 'items.productId',
          select: 'productName price image unit category subCategory productDescription nutritionalInfo availableStock'
        }
      ]
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    const order = assignment.orderId;
    
    // Format the response with enhanced product details
    const formattedAssignment = {
      assignmentId: assignment._id,
      orderId: order._id,
      status: assignment.status,
      statusHistory: assignment.statusHistory,
      createdAt: assignment.createdAt,
      customer: order.userId ? {
        name: order.userId.name,
        phone: order.userId.phone,
        email: order.userId.email
      } : null,
      address: order.address,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      items: order.items.map(item => {
        const product = item.productId || {};
        return {
          productId: product._id || null,
          productName: product.productName || 'Product',
          quantity: item.quantity || 0,
          price: product.price || 0,
          image: product.image || null,
          unit: product.unit || 'unit',
          category: product.category || 'Uncategorized',
          subCategory: product.subCategory || '',
          description: product.productDescription || '',
          nutritionalInfo: product.nutritionalInfo || '',
          total: (item.quantity || 0) * (product.price || 0)
        };
      }),
      notes: assignment.notes
    };
    
    res.status(200).json(formattedAssignment);
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    res.status(500).json({ message: 'Error fetching assignment details', error: error.message });
  }
};

// Update assignment status
const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['Assigned', 'In Progress', 'Delivered', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Assigned, In Progress, Delivered, Failed'
      });
    }
    
    // Find the delivery boy record by email
    const deliveryBoy = await DeliveryBoy.findOne({ email: req.user.email });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }
    
    // Find the assignment
    const assignment = await OrderAssignment.findOne({
      _id: id,
      deliveryBoyId: deliveryBoy._id
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Get the order
    const order = await Order.findById(assignment.orderId).populate({
      path: 'items.productId',
      select: 'productName price image unit'
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update the assignment status
    const previousStatus = assignment.status;
    assignment.status = status;
    
    // Add to status history
    assignment.statusHistory.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status updated from ${previousStatus} to ${status}`
    });
    
    await assignment.save();
    
    // Update order status based on assignment status
    if (status === 'Delivered') {
      order.status = 'Delivered';
      
      // Move from current orders to completed orders for the delivery boy
      const currentOrderIndex = deliveryBoy.currentOrders.indexOf(order._id);
      if (currentOrderIndex > -1) {
        deliveryBoy.currentOrders.splice(currentOrderIndex, 1);
      }
      
      // Increment total deliveries
      deliveryBoy.totalDeliveries = (deliveryBoy.totalDeliveries || 0) + 1;
      
      await deliveryBoy.save();
    } else if (status === 'Failed') {
      order.status = 'Delivery Failed';
      
      // Remove from current orders
      const currentOrderIndex = deliveryBoy.currentOrders.indexOf(order._id);
      if (currentOrderIndex > -1) {
        deliveryBoy.currentOrders.splice(currentOrderIndex, 1);
      }
      
      await deliveryBoy.save();
    } else if (status === 'In Progress') {
      order.status = 'Out for Delivery';
    }
    
    await order.save();
    
    // Send status update email to customer
    await sendDeliveryStatusUpdateEmail(order, status, notes);
    
    res.status(200).json({
      success: true,
      message: 'Assignment status updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment status',
      error: error.message
    });
  }
};

// Function to send delivery status update email to customer
const sendDeliveryStatusUpdateEmail = async (order, status, notes) => {
  try {
    // Get customer details
    const customer = await User.findById(order.userId);
    if (!customer || !customer.email) {
      console.log('Customer email not found, skipping status update email');
      return false;
    }
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Status color and message based on status
    let statusColor, statusMessage;
    switch(status) {
      case 'In Progress':
        statusColor = '#ff9800'; // Orange
        statusMessage = 'Your order is on the way!';
        break;
      case 'Delivered':
        statusColor = '#4CAF50'; // Green
        statusMessage = 'Your order has been delivered successfully!';
        break;
      case 'Failed':
        statusColor = '#f44336'; // Red
        statusMessage = 'There was an issue with your delivery.';
        break;
      default:
        statusColor = '#2196F3'; // Blue
        statusMessage = 'Your order status has been updated.';
    }
    
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: customer.email,
  subject: `Order #${order._id.toString().slice(-6)} Status Update: ${status}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: ${statusColor}; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1 style="color: white; margin: 0;">Order Status Update</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
        <p>Hello ${customer.name},</p>
        <p>${statusMessage}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f0f8ff; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #333;">Order Information:</h3>
          <p><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'https://parshuram-dairy.com'}/track-order/${order._id}" 
             style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Track Your Order
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
        
        <p style="font-size: 14px; color: #777; text-align: center;">
          Thank you for choosing Parshuram Dairy!
        </p>
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

// Get delivery history for a delivery boy
const getDeliveryHistory = async (req, res) => {
  try {
    // Find the delivery boy record by email
    const deliveryBoy = await DeliveryBoy.findOne({ email: req.user.email });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get filter parameters
    const status = req.query.status;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build filter object
    const filter = { deliveryBoyId: deliveryBoy._id };
    
    if (status && ['Delivered', 'Failed'].includes(status)) {
      filter.status = status;
    } else {
      filter.status = { $in: ['Delivered', 'Failed'] };
    }
    
    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.createdAt = { $gte: startDate };
    } else if (endDate) {
      filter.createdAt = { $lte: endDate };
    }

    // Get completed assignments
    const completedAssignments = await OrderAssignment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'orderId',
        select: 'userId items totalAmount address status createdAt paymentMethod',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      });

    // Get total count for pagination
    const totalCount = await OrderAssignment.countDocuments(filter);

    // Format assignments for easier frontend consumption
    const formattedAssignments = completedAssignments.map(assignment => {
      const order = assignment.orderId;
      return {
        assignmentId: assignment._id,
        orderId: order._id,
        status: assignment.status,
        createdAt: assignment.createdAt,
        completedAt: assignment.statusHistory
          .filter(h => h.status === assignment.status)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp,
        customer: order.userId ? {
          name: order.userId.name,
          phone: order.userId.phone
        } : null,
        address: order.address,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod
      };
    });

    res.status(200).json({
      count: formattedAssignments.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      assignments: formattedAssignments
    });
  } catch (error) {
    console.error('Error fetching delivery history:', error);
    res.status(500).json({ message: 'Error fetching delivery history', error: error.message });
  }
};

// Get earnings summary for a delivery boy
const getEarningsSummary = async (req, res) => {
  try {
    // Find the delivery boy record by email
    const deliveryBoy = await DeliveryBoy.findOne({ email: req.user.email });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    // Get filter parameters
    const period = req.query.period || 'week'; // 'day', 'week', 'month', 'year'
    
    // Calculate date ranges based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); // Default to last 30 days
    }
    
    // Get completed deliveries in the period
    const completedDeliveries = await OrderAssignment.find({
      deliveryBoyId: deliveryBoy._id,
      status: 'Delivered',
      createdAt: { $gte: startDate }
    }).populate({
      path: 'orderId',
      select: 'totalAmount'
    });
    
    // Calculate earnings (assuming a fixed percentage or amount per delivery)
    const commissionRate = 0.05; // 5% commission, adjust as needed
    const deliveryFeePerOrder = 20; // ₹20 per delivery, adjust as needed
    
    let totalEarnings = 0;
    let totalCommission = 0;
    let totalDeliveryFees = 0;
    
    completedDeliveries.forEach(delivery => {
      if (delivery.orderId && delivery.orderId.totalAmount) {
        const commission = delivery.orderId.totalAmount * commissionRate;
        totalCommission += commission;
        totalDeliveryFees += deliveryFeePerOrder;
      }
    });
    
    totalEarnings = totalCommission + totalDeliveryFees;
    
    // Get earnings breakdown by day for charts
    const dailyEarnings = [];
    const daysToShow = period === 'day' ? 1 : 
                       period === 'week' ? 7 : 
                       period === 'month' ? 30 : 365;
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayDeliveries = completedDeliveries.filter(delivery => {
        const deliveryDate = new Date(delivery.createdAt);
        return deliveryDate >= date && deliveryDate < nextDay;
      });
      
      let dayEarnings = 0;
      dayDeliveries.forEach(delivery => {
        if (delivery.orderId && delivery.orderId.totalAmount) {
          dayEarnings += (delivery.orderId.totalAmount * commissionRate) + deliveryFeePerOrder;
        }
      });
      
      dailyEarnings.push({
        date: date.toISOString().split('T')[0],
        earnings: dayEarnings,
        deliveries: dayDeliveries.length
      });
    }
    
    res.status(200).json({
      period,
      totalDeliveries: completedDeliveries.length,
      totalEarnings,
      breakdown: {
        commission: totalCommission,
        deliveryFees: totalDeliveryFees
      },
      dailyEarnings: dailyEarnings.reverse() // Reverse to get chronological order
    });
  } catch (error) {
    console.error('Error fetching earnings summary:', error);
    res.status(500).json({ message: 'Error fetching earnings summary', error: error.message });
  }
};

// Update delivery boy availability status
const updateAvailabilityStatus = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean value' });
    }
    
    // Find the delivery boy record by email
    const deliveryBoy = await DeliveryBoy.findOne({ email: req.user.email });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }
    
    // Update availability status
    deliveryBoy.isAvailable = isAvailable;
    await deliveryBoy.save();
    
    res.status(200).json({
      success: true,
      message: `Availability status updated to ${isAvailable ? 'available' : 'unavailable'}`,
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        isAvailable: deliveryBoy.isAvailable
      }
    });
  } catch (error) {
    console.error('Error updating availability status:', error);
    res.status(500).json({ message: 'Error updating availability status', error: error.message });
  }
};

module.exports = {
  getDeliveryDashboard,
  getCurrentAssignments,
  getAssignmentDetails,
  updateAssignmentStatus,
  getDeliveryHistory,
  getEarningsSummary,
  updateAvailabilityStatus
};