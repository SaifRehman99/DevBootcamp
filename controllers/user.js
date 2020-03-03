// model here
const User = require("../models/User");
const errorR = require("../utils/errorRESP");
const asyncHandler = require("../middleware/async");

// @desc   get all the users
// @routes GET /api/bootcamps/auth/user
// @Access PRIVATE/ADMIN
exports.getAllUsers = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advanceQuery);
});

// @desc   get single user
// @routes GET /api/bootcamps/auth/user/:id
// @Access PRIVATE/ADMIN
exports.getSingleUser = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new errorR("The user isnt registered", 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

// @desc   Create user
// @routes POST /api/bootcamps/auth/user
// @Access PRIVATE/ADMIN
exports.createUser = asyncHandler(async(req, res, next) => {
    const user = await User.create(req.body);

    res.status(200).json({
        success: true,
        message: "User Created",
        user
    });
});

// @desc   Update the user
// @routes PUT /api/bootcamps/auth/user/:id
// @Access PRIVATE/ADMIN
exports.updateUser = asyncHandler(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: "User Created",
        user
    });
});

// @desc   delete user
// @routes GET /api/bootcamps/auth/user/:id
// @Access PRIVATE/ADMIN
exports.deleteUser = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new errorR("The user isnt registered", 404));
    }

    user.remove();

    res.status(200).json({
        success: true,
        message: "User Deleted",
        data: {}
    });
});