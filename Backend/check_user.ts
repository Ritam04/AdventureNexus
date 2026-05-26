import mongoose from 'mongoose';
import User from './src/shared/database/models/userModel';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || '').then(async () => {
    const user = await User.findById('6a0eb9f94b01f85de8c4e3e0').lean();
    console.log("BY ID:", JSON.stringify(user, null, 2));
    
    mongoose.disconnect();
}).catch(console.error);
