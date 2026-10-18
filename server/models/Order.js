const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  dosage: String,
});

const orderSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['PENDING', 'VERIFICATION', 'CONFIRMED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    deliveryType: { type: String, enum: ['DELIVERY', 'PICKUP'], default: 'DELIVERY' },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    subtotal: Number,
    deliveryCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: Number,
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' },
    notes: String,
    cancellationReason: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.index({ patientId: 1, createdAt: -1 });
orderSchema.index({ pharmacyId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
