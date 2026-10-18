const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const LabBooking = require('../models/LabBooking');
const Order = require('../models/Order');

// Initialize Razorpay client with credentials
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys are not configured in environment variables');
  }
  return new Razorpay({ key_id, key_secret });
};

// @desc    Get Razorpay public Key ID
// @route   GET /api/payments/key
// @access  Public / Authenticated
exports.getKey = (req, res) => {
  res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || '',
  });
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { amount, serviceType = 'APPOINTMENT', serviceId, description } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid payment amount is required' });
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(Number(amount) * 100), // in paise
      currency: 'INR',
      receipt: `rcpt_${serviceType.slice(0, 3)}_${Date.now()}`.slice(0, 40),
      notes: {
        userId: req.user._id.toString(),
        serviceType,
        serviceId: serviceId ? serviceId.toString() : '',
      },
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment record in DB
    if (serviceId) {
      await Payment.create({
        userId: req.user._id,
        serviceType,
        serviceId,
        amount: Number(amount),
        currency: 'INR',
        status: 'PENDING',
        gateway: 'RAZORPAY',
        gatewayOrderId: order.id,
        description: description || `${serviceType} Payment`,
      });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay createOrder error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create payment order' });
  }
};

// @desc    Verify Razorpay payment signature & update database status
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      serviceType = 'APPOINTMENT',
      serviceId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment signature verification parameters' });
    }

    // Verify HMAC SHA256 signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      if (razorpay_order_id) {
        await Payment.findOneAndUpdate(
          { gatewayOrderId: razorpay_order_id },
          { status: 'FAILED' }
        );
      }
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
    }

    // Update payment record in database
    let payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id });
    if (payment) {
      payment.status = 'SUCCESS';
      payment.gatewayPaymentId = razorpay_payment_id;
      payment.gatewaySignature = razorpay_signature;
      await payment.save();
    } else if (serviceId) {
      payment = await Payment.create({
        userId: req.user._id,
        serviceType,
        serviceId,
        amount: req.body.amount || 500,
        currency: 'INR',
        status: 'SUCCESS',
        gateway: 'RAZORPAY',
        gatewayOrderId: razorpay_order_id,
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
      });
    }

    // Update corresponding service record
    if (serviceType === 'APPOINTMENT' && serviceId) {
      const appt = await Appointment.findByIdAndUpdate(
        serviceId,
        { paymentStatus: 'PAID', status: 'CONFIRMED' },
        { new: true }
      );

      // Create confirmation notification
      await Notification.create({
        userId: req.user._id,
        title: 'Payment Confirmed',
        message: `Your payment of ₹${payment?.amount || 500} was confirmed via Razorpay. Your appointment is now active.`,
        type: 'APPOINTMENT',
        link: `/patient/appointments/${serviceId}`,
      });
    } else if (serviceType === 'LAB_BOOKING' && serviceId) {
      await LabBooking.findByIdAndUpdate(serviceId, { paymentStatus: 'PAID' });
    } else if (serviceType === 'PHARMACY_ORDER' && serviceId) {
      await Order.findByIdAndUpdate(serviceId, { paymentStatus: 'PAID', status: 'CONFIRMED' });
    }

    res.json({
      success: true,
      message: 'Payment verified and confirmed successfully!',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err) {
    console.error('Razorpay verifyPayment error:', err);
    res.status(500).json({ success: false, message: err.message || 'Payment verification failed' });
  }
};
