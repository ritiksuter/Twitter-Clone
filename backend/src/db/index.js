import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
        console.log("MongoDB connected successfully", conn.connection.host);
    }
    catch (error) {
        console.log("Something went wrong while connectiong to the database");
        process.exit(1);
    }
}

export { connectDB };