const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    serviceType: { type: String, enum: ['APPOINTMENT', 'LAB_BOOKING', 'PHARMACY_ORDER'] },
    serviceId: { type: mongoose.Schema.Types.ObjectId },
    providerName: String,
    providerAddress: String,
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    subtotal: Number,
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: Number,
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['UNPAID', 'PAID', 'REFUNDED'], default: 'UNPAID' },
    dueDate: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function () {
  if (!this.invoiceNumber) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.invoiceNumber = `INV-${dateStr}-${random}`;
  }
});

invoiceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
