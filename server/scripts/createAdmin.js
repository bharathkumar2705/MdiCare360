const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function setupAdmin() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://admin:bharath%402705@cluster0.dxrlarp.mongodb.net/medicare360?retryWrites=true&w=majority';
  await mongoose.connect(uri);

  const email = process.argv[2] || 'admin@medicare360.com';
  const password = process.argv[3] || 'Admin@123456';
  const name = process.argv[4] || 'Platform Administrator';

  const hashedPassword = await bcrypt.hash(password, 12);
  const usersCol = mongoose.connection.db.collection('users');

  const existing = await usersCol.findOne({ email });
  if (existing) {
    await usersCol.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          role: 'PLATFORM_ADMIN',
          isEmailVerified: true,
          isActive: true,
        },
      }
    );
    console.log(`SUCCESS: Updated existing account ${email} to PLATFORM_ADMIN with password: ${password}`);
  } else {
    await usersCol.insertOne({
      name,
      email,
      password: hashedPassword,
      role: 'PLATFORM_ADMIN',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`SUCCESS: Created new PLATFORM_ADMIN ${email} with password: ${password}`);
  }

  await mongoose.disconnect();
}

setupAdmin().catch((err) => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
