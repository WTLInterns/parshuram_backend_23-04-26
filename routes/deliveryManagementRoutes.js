const express = require('express');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { 
  getAllDeliveryBoys,
  getDeliveryBoyDetails
} = require('../controllers/deliveryManagementController');

const router = express.Router();

// Dashboard routes for admin to manage delivery boys
//router.get('/delivery-boys', protect, isAdmin, getAllDeliveryBoys);
//router.get('/delivery-boys/:id', protect, isAdmin, getDeliveryBoyDetails);

router.get('/delivery-boys', getAllDeliveryBoys);
router.get('/delivery-boys/:id',  getDeliveryBoyDetails);


module.exports = router;