const mongoose = require('mongoose');

const orderAssignmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },
    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryBoy',
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Assigned', 'In Progress', 'Delivered', 'Failed'],
      default: 'Assigned'
    },
    deliveryNotes: {
      type: String
    },
    deliveredAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrderAssignment', orderAssignmentSchema);