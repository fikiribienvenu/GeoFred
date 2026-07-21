import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['admin', 'agent', 'client'], default: 'client' },
  status: { type: String, default: 'active' },
  emailVerified: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected');

  // Update existing admin
  const existing = await User.findOneAndUpdate(
    { role: 'admin' },
    { email: 'geofredeterra@gmail.com', phone: '+250786532159' },
    { new: true }
  );

  if (existing) {
    console.log('✅ Admin email updated to: geofredeterra@gmail.com');
  } else {
    const hash = await bcrypt.hash('Admin@123!', 12);
    await User.create({
      name: 'System Administrator',
      email: 'geofredeterra@gmail.com',
      phone: '+250786532159',
      password: hash,
      role: 'admin',
      status: 'active',
      emailVerified: true,
    });
    console.log('✅ New admin created: geofredeterra@gmail.com / Admin@123!');
  }

  await mongoose.disconnect();
  console.log('Done');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
