require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const col = db.collection('servicerequests');

  // Add isGuest: false to all existing requests that don't have it
  const r1 = await col.updateMany(
    { isGuest: { $exists: false } },
    { $set: { isGuest: false } }
  );
  console.log('Added isGuest field to', r1.modifiedCount, 'records');

  // Verify the collection works
  const count = await col.countDocuments();
  console.log('Total service requests:', count);

  console.log('Migration complete!');
  process.exit(0);
}).catch(e => {
  console.log('Error:', e.message);
  process.exit(1);
});
