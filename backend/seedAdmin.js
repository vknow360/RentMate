const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Remove existing admin if any to allow fresh seeding with hashed password
    const adminExists = await User.findOne({ email: 'admin@rentmate.com' });
    if (adminExists) {
      await User.deleteOne({ email: 'admin@rentmate.com' });
      console.log('Removed existing admin for re-seeding');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword123', salt);

    const admin = new User({
      name: 'Super Admin',
      email: 'admin@rentmate.com',
      password: hashedPassword,
      phone: '0000000000',
      role: 'admin',
      isVerified: true
    });

    await admin.save();
    console.log('Admin user created successfully with hashed password: admin@rentmate.com / adminpassword123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
