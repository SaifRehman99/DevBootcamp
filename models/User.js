const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        required: [true, "Please enter name"]
    },
    email: {
        type: String,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email"
        ],
        required: [true, "Enter Email"]
    },
    role: {
        type: String,
        // user who review then publisher who create bootcamps and course
        enum: ["user", "publisher"],
        default: "user"
    },
    password: {
        type: String,
        minlength: 6,
        select: false,
        required: [true, "Please enter password"]
    },
    passwordReset: String,
    passwordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// mongoose middleware to hash the password
userSchema.pre("save", async function(next) {
    // if password is not change, move next
    // because while saving resetToken it trigger islea change kara
    if (!this.isModified("password")) {
        next();
    }

    // only run when password is modified
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

// to keep the controller clean we do it here
// this is method
// method calls on user instant from model and static direct call
userSchema.methods.getSignToken = function() {
    // returning the token here
    // register user p call huga islea id uski hugi
    return JWT.sign({ id: this._id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRES
    });
};

// checking the password here
userSchema.methods.comparePassword = async function(pass) {
    return await bcryptjs.compare(pass, this.password);
};

// generating token here and hash it
userSchema.methods.getResetToken = function() {
    // creating token here
    const token = crypto.randomBytes(20).toString("hex");

    // hashing the token here
    this.passwordReset = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // setting the expiration data (10 MINS)
    this.passwordExpire = Date.now() + 10 * 60 * 1000;

    return token;
};


module.exports = mongoose.model("User", userSchema);