const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const deleteAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@cycling.com';
        const result = await User.deleteOne({ email: adminEmail });
        
        if (result.deletedCount > 0) {
            console.log('✅ Admin account deleted successfully!');
        } else {
            console.log('ℹ️  Admin account not found.');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error deleting admin:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

deleteAdmin();
