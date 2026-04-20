const DeliveryBoy = require('../models/DeliveryBoy');
const OrderAssignment = require('../models/OrderAssignment');
const Order = require('../models/Order');
const User = require('../models/User');

// Get all delivery boys with basic information for dashboard list view
const getAllDeliveryBoys = async (req, res) => {
  try {
    console.log("welcome to the delivery boys")
    // Get all delivery boys with basic information
    const deliveryBoys = await DeliveryBoy.find().select(
      'name email phone isAvailable currentOrders totalDeliveries pincodes areas maxOrdersPerDay'
    );

    // Get assignment counts for each delivery boy
    const deliveryBoysWithStats = await Promise.all(
      deliveryBoys.map(async (boy) => {
        // Get all assignments for this delivery boy with populated order details
        const assignments = await OrderAssignment.find({ deliveryBoyId: boy._id })
          .sort({ createdAt: -1 })
          .populate({
            path: 'orderId',
            select: 'userId items totalAmount address status createdAt paymentMethod',
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
        
        // Count assignments by status
        const pendingCount = assignments.filter(a => a.status === 'Assigned').length;
        const inProgressCount = assignments.filter(a => a.status === 'In Progress').length;
        const deliveredCount = assignments.filter(a => a.status === 'Delivered').length;
        const failedCount = assignments.filter(a => a.status === 'Failed').length;
        
        // Get today's assignments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAssignments = assignments.filter(assignment => {
          const assignmentDate = new Date(assignment.createdAt);
          assignmentDate.setHours(0, 0, 0, 0);
          return assignmentDate.getTime() === today.getTime();
        });

        // Get active assignments (Assigned or In Progress)
        const activeAssignments = assignments.filter(a => 
          a.status === 'Assigned' || a.status === 'In Progress'
        );
        
        // Format assignments for easier frontend consumption
        const formatAssignment = (assignment) => {
          const order = assignment.orderId;
          if (!order) return null; // Skip if order is not found
          
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
                totalPrice: (item.quantity || 0) * (product.price || 0)
              };
            })
          };
        };
        
        // Format active assignments
        const formattedActiveAssignments = activeAssignments
          .map(formatAssignment)
          .filter(Boolean); // Remove null values

        return {
          _id: boy._id,
          name: boy.name,
          email: boy.email,
          phone: boy.phone,
          isAvailable: boy.isAvailable,
          currentOrderCount: boy.currentOrders.length,
          totalDeliveries: boy.totalDeliveries || 0,
          pincodes: boy.pincodes || [],
          areas: boy.areas || [],
          maxOrdersPerDay: boy.maxOrdersPerDay,
          stats: {
            totalAssignments: assignments.length,
            todayAssignments: todayAssignments.length,
            pendingCount,
            inProgressCount,
            deliveredCount,
            failedCount
          },
          activeAssignments: formattedActiveAssignments.slice(0, 3) // Limit to 3 recent active assignments
        };
      })
    );

    res.status(200).json({
      success: true,
      count: deliveryBoysWithStats.length,
      data: deliveryBoysWithStats
    });
  } catch (error) {
    console.error('Error fetching delivery boys for dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery boys',
      error: error.message
    });
  }
};

// Get detailed information about a specific delivery boy by ID
const getDeliveryBoyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the delivery boy
    const deliveryBoy = await DeliveryBoy.findById(id);
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }
    
    // Get all assignments for this delivery boy
    const assignments = await OrderAssignment.find({ deliveryBoyId: id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'orderId',
        select: 'userId items totalAmount address status createdAt paymentMethod',
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
    
    // Get active assignments (Assigned or In Progress)
    const activeAssignments = assignments.filter(a => 
      a.status === 'Assigned' || a.status === 'In Progress'
    );
    
    // Get completed assignments (Delivered or Failed)
    const completedAssignments = assignments.filter(a => 
      a.status === 'Delivered' || a.status === 'Failed'
    );
    
    // Format assignments for easier frontend consumption
    const formatAssignment = (assignment) => {
      const order = assignment.orderId;
      if (!order) return null; // Skip if order is not found
      
      return {
        assignmentId: assignment._id,
        orderId: order._id,
        status: assignment.status,
        statusHistory: assignment.statusHistory || [],
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
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
            totalPrice: (item.quantity || 0) * (product.price || 0)
          };
        })
      };
    };
    
    // Format active and completed assignments
    const formattedActiveAssignments = activeAssignments
      .map(formatAssignment)
      .filter(Boolean); // Remove null values
      
    const formattedCompletedAssignments = completedAssignments
      .map(formatAssignment)
      .filter(Boolean); // Remove null values
    
    // Get assignments by status
    const pendingAssignments = assignments.filter(a => a.status === 'Assigned');
    const inProgressAssignments = assignments.filter(a => a.status === 'In Progress');
    const deliveredAssignments = assignments.filter(a => a.status === 'Delivered');
    const failedAssignments = assignments.filter(a => a.status === 'Failed');
    
    // Get today's assignments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAssignments = assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.createdAt);
      assignmentDate.setHours(0, 0, 0, 0);
      return assignmentDate.getTime() === today.getTime();
    });
    
    // Calculate performance metrics
    const deliverySuccessRate = assignments.length > 0 
      ? (deliveredAssignments.length / assignments.length * 100).toFixed(2) 
      : 0;
    
    // Calculate average delivery time (in hours) for completed deliveries
    let avgDeliveryTime = 0;
    if (deliveredAssignments.length > 0) {
      const totalDeliveryTime = deliveredAssignments.reduce((total, assignment) => {
        // Find the delivered status in history
        const deliveredStatus = assignment.statusHistory?.find(s => s.status === 'Delivered');
        const assignedStatus = assignment.statusHistory?.find(s => s.status === 'Assigned');
        
        if (deliveredStatus && assignedStatus) {
          const deliveredTime = new Date(deliveredStatus.timestamp);
          const assignedTime = new Date(assignedStatus.timestamp);
          const timeDiff = (deliveredTime - assignedTime) / (1000 * 60 * 60); // Convert to hours
          return total + timeDiff;
        }
        return total;
      }, 0);
      
      avgDeliveryTime = (totalDeliveryTime / deliveredAssignments.length).toFixed(2);
    }
    
    res.status(200).json({
      success: true,
      data: {
        deliveryBoy: {
          _id: deliveryBoy._id,
          name: deliveryBoy.name,
          email: deliveryBoy.email,
          phone: deliveryBoy.phone,
          isAvailable: deliveryBoy.isAvailable,
          currentOrderCount: deliveryBoy.currentOrders.length,
          totalDeliveries: deliveryBoy.totalDeliveries || 0,
          pincodes: deliveryBoy.pincodes || [],
          areas: deliveryBoy.areas || [],
          maxOrdersPerDay: deliveryBoy.maxOrdersPerDay,
          // Add location if available
          location: deliveryBoy.location || null
        },
        stats: {
          totalAssignments: assignments.length,
          todayAssignments: todayAssignments.length,
          pendingCount: pendingAssignments.length,
          inProgressCount: inProgressAssignments.length,
          deliveredCount: deliveredAssignments.length,
          failedCount: failedAssignments.length,
          deliverySuccessRate: `${deliverySuccessRate}%`,
          avgDeliveryTime: `${avgDeliveryTime} hours`
        },
        activeAssignments: formattedActiveAssignments,
        completedAssignments: formattedCompletedAssignments.slice(0, 10) // Limit to 10 recent completed assignments
      }
    });
  } catch (error) {
    console.error('Error fetching delivery boy details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery boy details',
      error: error.message
    });
  }
};

module.exports = {
  getAllDeliveryBoys,
  getDeliveryBoyDetails
};