const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Admin credentials
        const adminEmail = 'admin@cycling.com';
        const adminPassword = 'Admin123!';
        const adminName = 'Admin User';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', adminEmail);
            console.log('Password:', adminPassword);
            await mongoose.connection.close();
            return;
        }

        // Create admin user (password will be hashed by User model's pre-save hook)
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword, // Plain password - will be hashed by pre-save hook
            role: 'admin'
        });

        console.log('✅ Admin account created successfully!');
        console.log('\n📧 Credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('\n⚠️  Please change the password after first login!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createAdmin();
