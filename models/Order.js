// const mongoose = require("mongoose")

// const orderSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     items: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         action: { type: String, enum: ["block", "unblock"], default: "unblock" }, // ✅ Added action field
//         status: { type: String, enum: ["active", "block"], default: "active" }, // ✅ Status inside items
//         quantity: { type: Number, required: true },
//         size: { type: String, required: true },
//         returnRequested: { type: Boolean, default: false },
//         returnApproved: { type: Boolean, default: false },
//         returnReason: { type: String, default: "" },
//       },
//     ],
//     totalAmount: { type: Number, required: true },
//     paymentMethod: { type: String, required: false, enum: ["Credit Card", "Debit Card", "PayPal", "Cash on Delivery"] },
//     address: { type: Object, required: true },
//     status: { type: String, enum: ["Shipping","Pending","Delivered","Cancelled","Processing",'Confirmed'], default: " " },
//     payment: { type: Boolean, required: false, default: false },
//     date: { type: Date, default: Date.now },
//     tentativeDeliveryDate: { type: Date, required: false }, // New field added
//   },
//   { timestamps: false },
// )

// module.exports = mongoose.model("Order", orderSchema)





const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref:"Product", required: true },
        action: { type: String, enum: ["block", "unblock"], default: "unblock" }, 
        status: { type: String, enum: ["active", "block"], default: "active" }, 
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Added price field which seems to be in your request
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "PayPal", "Cash on Delivery", "COD"], // Added "COD"
    },
    
    Status:{type:String,enum:["Pending","Confirmed","Cancelled","Delivered"], default: "Pending"},
    address: { type: Object, required: true },
    payment: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
