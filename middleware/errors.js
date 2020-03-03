const ErrorR = require("../utils/errorRESP");

const errorLog = (err, req, res, next) => {
    let error = {...err };

    // getting the static error message here
    error.message = err.message;

    //mongoose BAD OBJECT ID
    if (err.name === "CastError") {
        const message = `Invalid resource ID`;
        error = new ErrorR(message, 404);
    }

    // mongo Duplicate Error
    if (err.code === 11000) {
        const message = `Duplicate Value not ALLOWED`;
        error = new ErrorR(message, 400);
    }

    // mongo Validation Error
    if (err.name === "ValidationError") {
        // it enumerate the obj and returns the values in array
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorR(message, 400);
    }

    // this is for the static error
    res.status(error.statusCode || 500).json({
        success: false,
        data: error.message || "Server Error"
    });
};

module.exports = errorLog;