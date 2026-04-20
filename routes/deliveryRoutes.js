const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
  createDeliveryBoy,
  getAllDeliveryBoys,
  getDeliveryBoyById,
  updateDeliveryBoy,
  deleteDeliveryBoy,
  getDeliveryBoyOrders
} = require("../controllers/deliveryBoyController");

const {
  manuallyAssignDeliveryBoy,
  updateAssignmentStatus,
  getAllAssignments,
  getAssignmentById
} = require("../controllers/orderAssignmentController");

const router = express.Router();

// Delivery Boy routes
router.post("/delivery-boys",  createDeliveryBoy);
router.get("/delivery-boys",  getAllDeliveryBoys);
router.get("/delivery-boys/:id", protect, getDeliveryBoyById);
router.put("/delivery-boys/:id", protect, updateDeliveryBoy);
router.delete("/delivery-boys/:id", deleteDeliveryBoy);
router.get("/delivery-boys/:id/orders", protect, getDeliveryBoyOrders);

// Order Assignment routes
router.post("/assignments", protect, manuallyAssignDeliveryBoy);
router.put("/assignments/:assignmentId/status", protect, updateAssignmentStatus);
router.get("/assignments",  getAllAssignments);
router.get("/assignments/:id", protect, getAssignmentById);

module.exports = router;