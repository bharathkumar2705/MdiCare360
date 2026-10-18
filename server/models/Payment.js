const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceType: {
      type: String,
      enum: ['APPOINTMENT', 'LAB_BOOKING', 'PHARMACY_ORDER'],
      required: true,
    },
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    gateway: { type: String, default: 'RAZORPAY' },
    gatewayOrderId: { type: String }, // Razorpay order_id
    gatewayPaymentId: { type: String }, // Razorpay payment_id
    gatewaySignature: { type: String, select: false },
    refundId: String,
    refundAmount: Number,
    refundedAt: Date,
    description: String,
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
