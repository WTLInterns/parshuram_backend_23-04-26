// const express = require('express');
// const { protect, isDeliveryBoy } = require('../middleware/authMiddleware');
// const { getDeliveryDashboard } = require('../controllers/deliveryDashboardController');

// const router = express.Router();

// // Dashboard routes for delivery boys
// router.get('/', protect, isDeliveryBoy, getDeliveryDashboard);

// module.exports = router;





const express = require('express');
const { protect, isDeliveryBoy } = require('../middleware/authMiddleware');
const { 
  getDeliveryDashboard, 
  getCurrentAssignments, 
  getAssignmentDetails,
  updateAssignmentStatus,
  getDeliveryHistory,
  getEarningsSummary,
  updateAvailabilityStatus
} = require('../controllers/deliveryDashboardController');

const router = express.Router();

// Dashboard routes for delivery boys
router.get('/', protect, isDeliveryBoy, getDeliveryDashboard);
router.get('/current-assignments', protect, isDeliveryBoy, getCurrentAssignments);
router.get('/assignment/:id', protect, isDeliveryBoy, getAssignmentDetails);
router.put('/assignment/:id/status', protect, isDeliveryBoy, updateAssignmentStatus);
router.get('/history', protect, isDeliveryBoy, getDeliveryHistory);
router.get('/earnings', protect, isDeliveryBoy, getEarningsSummary);
router.put('/availability', protect, isDeliveryBoy, updateAvailabilityStatus);

module.exports = router;