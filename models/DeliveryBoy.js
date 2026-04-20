


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryBoySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: { 
      type: String, 
      required: true 
    },
    pincodes: [{ 
      type: String 
    }],
    areas: [{ 
      type: String 
    }],
    isAvailable: { 
      type: Boolean, 
      default: true 
    },
    maxOrdersPerDay: { 
      type: Number, 
      default: 20 
    },
    currentOrders: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order' 
    }],
    completedOrders: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order' 
    }],
    role: {
      type: String,
      enum: ["user", "DeliveryBoy"],
      default: "DeliveryBoy",
    },
  },
  { timestamps: true }
);

// 🔹 Hash password before saving
deliveryBoySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 Method to compare passwords
deliveryBoySchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
