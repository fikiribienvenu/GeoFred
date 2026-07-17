require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await mongoose.connection.db.collection('agents').updateMany(
    { approvalStatus: 'approved' },
    { $set: { canUploadProperties: true } }
  );
  console.log('✅ Updated', result.modifiedCount, 'approved agents — canUploadProperties = true');
  process.exit(0);
}).catch(e => {
  console.log('❌ Error:', e.message);
  process.exit(1);
});
