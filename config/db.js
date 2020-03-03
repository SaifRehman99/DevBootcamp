const mongoose = require("mongoose");

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });

        console.log(`Connected to ${conn.connection.host}`);
    } catch (e) {
        console.log("Error connecting to the MONGODB");
    }
};

module.exports = connectDB;