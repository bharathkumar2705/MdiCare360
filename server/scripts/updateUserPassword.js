const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function updatePassword() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://admin:bharath%402705@cluster0.dxrlarp.mongodb.net/medicare360?retryWrites=true&w=majority';
  await mongoose.connect(uri);

  const email = process.argv[2] || 'dr.priya.sharma@demo.com';
  const password = process.argv[3] || 'Doctor@123';

  const hashed = await bcrypt.hash(password, 12);
  const res = await mongoose.connection.db.collection('users').updateOne(
    { email },
    { $set: { password: hashed, isEmailVerified: true, isActive: true } }
  );

  console.log(`Updated password for ${email}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  await mongoose.disconnect();
}

updatePassword().catch(console.error);
