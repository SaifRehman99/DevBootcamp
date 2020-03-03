// model here
const userModel = require("../models/User");
const errorR = require("../utils/errorRESP");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc   register the user
// @routes POST /api/auth/register
// @Access PUBLIC
exports.register = asyncHandler(async(req, res, next) => {
    const { name, email, password, role } = req.body;

    const user = await userModel.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res, "User Registered!, Now You can login");
});

// @desc   login the user
// @routes POST /api/auth/login
// @Access PUBLIC
exports.login = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;

    // validating the email and password
    if (!email || !password) {
        return next(new errorR(`Please Enter Complete fields`, 404));
    }

    // checking email here
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        return next(new errorR(`No user is registered again that email`, 404));
    }

    // checking password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return next(new errorR(`Password doesnt match`, 404));
    }

    sendTokenResponse(user, 200, res, "User Login Successfuly");
});

// @desc   Get current user
// @routes GET /api/auth/me
// @Access PRIVATE
exports.getUser = asyncHandler(async(req, res, next) => {
    if (!req.user) {
        return next(new errorR(`Login first to see details`, 404));
    }
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});

// @desc   RESET Password
// @routes POST /api/auth/forgot
// @Access PUBLIC
exports.forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await userModel.findOne({ email: req.body.email });

    // checking for the user
    if (!user) {
        return next(new errorR(`No user is registered to this email`, 404));
    }

    // getting the token here
    const resetToken = user.getResetToken();

    // saving the resetPassword token and expiration to the database here
    user.save({ validateBeforeSave: false });

    //============================= sending the email here ========================== //

    //create resetURL
    const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/resetPassword/${resetToken}`;

    const message = `Please follow the ${resetURL} to reset our password with PUT request, THE LINK WILL EXPIRES IN 10MINS`;

    try {
        await sendEmail({
            email: req.body.email,
            subject: "RESET PASSWORD",
            message
        });

        return res.status(200).json({
            success: true,
            message: "Reset Link send"
        });
    } catch (e) {
        console.log(e);

        user.passwordReset = undefined;
        user.passwordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(403).json({
            success: false,
            message: "Email Couldn't send"
        });
    }

    res.status(200).json({
        success: true,
        user
    });
});

// @desc   Reset Password
// @routes PUT /api/auth/resetPassword/:resetToken
// @Access PUBLIC
exports.resetPassword = asyncHandler(async(req, res, next) => {
    // getting the token and hashing it to verify
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

    // checking the user here
    const user = await userModel.findOne({
        passwordReset: hashedToken,
        passwordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new errorR(`Invalid Token`, 404));
    }

    if (!req.body.password) {
        return next(new errorR(`Please Enter Password First`, 403));
    }

    // setting the updated password here and clearing tokens
    user.password = req.body.password;
    user.passwordReset = undefined;
    user.passwordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res, "Password has been reset");
});

// @desc   update current user
// @routes PUT /api/auth/updateUser
// @Access PRIVATE
exports.updateUser = asyncHandler(async(req, res, next) => {
    const updateUser = {
        email: req.body.email,
        name: req.body.name
    };

    const user = await userModel.findByIdAndUpdate(req.user.id, updateUser, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        user
    });
});

// @desc   update current user Password
// @routes PUT /api/auth/updatePassword
// @Access PRIVATE
exports.updatePassword = asyncHandler(async(req, res, next) => {
    const user = await userModel.findById(req.user.id).select("+password");

    if (!user) {
        return next(new errorR(`No user available`, 404));
    }

    if (!(await user.comparePassword(req.body.currentPassword))) {
        return next(new errorR(`Current Password is WRONG`, 404));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, "Password Updated");
});



// @desc   Logout user /clear cookie
// @routes GET /api/auth/logout
// @Access PRIVATE
exports.logoutUser = asyncHandler(async(req, res, next) => {

    //for logout we use cookie token to clear

    res.cookie('token', 'none', {
        // expires in 10MINS
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        user: {}
    });
});



// get token from model and create cookie and send repsonse
// basically sending the cookie with token
const sendTokenResponse = (user, status, res, message) => {
    // Create token here
    // this will access that id islea model p this._id
    const token = user.getSignToken();

    const options = {
        // this will convert the time 15day from now
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    // if in production tou secure true
    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    res
        .status(status)
        .cookie("token", token, options)
        .json({ success: true, message, token });
};