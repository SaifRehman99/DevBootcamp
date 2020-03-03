// model here
const bootcamp = require("../models/Bootcampers");
const errorR = require("../utils/errorRESP");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const path = require("path");

// @desc   get all the bootcampers with some filters
// @routes GET /api/bootcamps
// @Access PUBLIC
exports.getAllBootcampers = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advanceQuery);
});

// @desc   create single bootcamper
// @routes POST /api/bootcamps
// @Access PRIVATE
exports.createSingleBootcamper = asyncHandler(async(req, res, next) => {
    // setting the user here to the req.body
    req.body.user = req.user.id;

    const userPublished = await bootcamp.findOne({ user: req.user.id });

    // already one found and its role is not admin
    if (userPublished && req.user.role !== "admin") {
        return next(new errorR(`User cant add more than one bootcamp`, 403));
    }

    const data = await bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data
    });
});

// @desc   get single bootcamper
// @routes GET /api/bootcamps/id
// @Access PUBLIC
exports.getSingleBootcamper = asyncHandler(async(req, res, next) => {
    const data = await bootcamp.findById(req.params.id);

    if (!data) {
        // this is static error only
        return next(new errorR(`No bootcamp found of id ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data
    });
});

// @desc   update the single bootcamper
// @routes PATCH /api/bootcamps/id
// @Access PRIVATE
exports.updateSingleBootcamper = asyncHandler(async(req, res, next) => {
    const data = await bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!data) {
        // this is static error only
        return next(new errorR(`No bootcamp found of id ${req.params.id}`, 404));
    }

    res.status(200).json({
        message: `Bootcamper of id ${req.params.id} Updated`,
        data
    });
});

// @desc    delete the single bootcamper
// @routes DELETE /api/bootcamps/id
// @Access PRIVATE
exports.deleteSingleBootcamper = asyncHandler(async(req, res, next) => {
    const data = await bootcamp.findById(req.params.id);

    if (!data) {
        // this is static error only
        return next(new errorR(`No bootcamp found of id ${req.params.id}`, 404));
    }

    // this will trigger the middleware of cascade delete wrna findbyidanddelete kafi tha
    data.remove();

    res.status(200).json({
        success: true,
        message: `Bootcamper of id ${req.params.id} Deleted`,
        data: {}
    });
});

// @desc   get   bootcamper within the radius
// @routes GET   /api/bootcamps/radius/zipcode/distance
// @Access PRIVATE
exports.getBootcamperWithRadius = asyncHandler(async(req, res, next) => {
    // getting the data here
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lng = loc[0].longitude;
    const lat = loc[0].latitude;

    // calculating the RADIUS HERE
    // Divide distance by radius of earth
    // Earth Radius = 3,963mi / 6378KM
    const radius = distance / 3963;

    const bootcamps = await bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

// @desc    Uplaod bootcampe image
// @routes  PATCH /api  /bootcamps/:id/upload
// @Access  PRIVATE
exports.bootcampUpload = asyncHandler(async(req, res, next) => {
    const data = await bootcamp.findById(req.params.id);

    if (!data) {
        // this is static error only
        return next(new errorR(`No bootcamp found of id ${req.params.id}`, 404));
    }

    // if no photo found
    if (!req.files) {
        return next(new errorR(`No photo found`, 400));
    }

    // photo is the key
    const file = req.files.photo;

    // some type of validation here
    // if start with image/jgp|png will be image type
    if (!file.mimetype.startsWith("image")) {
        return next(new errorR(`File should be image type`, 400));
    }

    // if greater than 1mb
    if (file.size > process.env.PHOTO_SIZE) {
        return next(new errorR(`Image should be less than 1mb`, 400));
    }

    // create custom file name
    file.name = `photo_${data._id}${path.extname(file.name)}`;

    // uploading file to drive
    file.mv(`${process.env.PHOTO_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            return next(new errorR(`Problem with file uploading`, 500));
        }

        await bootcamp.findByIdAndUpdate(
            req.params.id, {
                photo: file.name
            }, {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});