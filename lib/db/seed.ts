/**
 * Database Seed Script
 * Run with: npx ts-node lib/db/seed.ts
 * Or: npx tsx lib/db/seed.ts
 *
 * Creates the first admin user.
 * Make sure MONGODB_URI is set in .env.local
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

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

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@geofred.com' });
    if (existing) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123!', 12);

    await User.create({
      name: 'System Administrator',
      email: 'admin@geofred.com',
      phone: '+250788000000',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      emailVerified: true,
    });

    console.log('✅ Admin user created:');
    console.log('   Email:    admin@geofred.com');
    console.log('   Password: Admin@123!');
    console.log('   ⚠️  Change this password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
