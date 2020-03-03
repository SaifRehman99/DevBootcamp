const errorR = require("../utils/errorRESP");
const asyncHandler = require("../middleware/async");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

// creating the protect middleware to verify the user
exports.protect = asyncHandler(async(req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        // set token from Bearer header
        token = req.headers.authorization.split(" ")[1];
        // set token via cookie
    } else if (req.cookies.token) {
        token = req.cookies.token
    }

    // if token not exist
    if (!token) {
        return next(new errorR(`NO ACCESS`, 401));
    }

    // verifying the token here
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        // setting the logged in user details here
        req.user = await userModel.findById(decoded.id);

        next();
    } catch (e) {
        return next(new errorR(`NO ACCESS`, 401));
    }
});

// Grant access to specific roles
// ...roles this will convert into array
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // we can check the values of array using includes
        if (!roles.includes(req.user.role)) {
            return next(
                new errorR(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};