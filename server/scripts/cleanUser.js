const mongoose = require('mongoose');

async function clean() {
  const uri = 'mongodb+srv://admin:bharath%402705@cluster0.dxrlarp.mongodb.net/medicare360?retryWrites=true&w=majority';
  await mongoose.connect(uri);
  const emails = ['bharathkumarreddynaru@gmail.com', 'bharathkumarreddynaru2705@gmail.com'];
  const users = await mongoose.connection.db.collection('users').find({ email: { $in: emails } }).toArray();
  const uids = users.map(u => u._id);
  
  if (uids.length > 0) {
    await mongoose.connection.db.collection('patients').deleteMany({ userId: { $in: uids } });
  }
  const res = await mongoose.connection.db.collection('users').deleteMany({ email: { $in: emails } });
  console.log(`Deleted ${res.deletedCount} users to allow clean registration!`);
  await mongoose.disconnect();
}

clean().catch(console.error);
