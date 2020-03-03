// model here
const CoursesModel = require("../models/Courses");
const bootcampModel = require("../models/Bootcampers");
const errorR = require("../utils/errorRESP");
const asyncHandler = require("../middleware/async");

// @desc   get all Courses
// @routes GET /api/courses
// @routes GET /api/bootcamps/:bootcampID/courses
// @Access PUBLIC
exports.getCourses = asyncHandler(async(req, res, next) => {
    // getting the courses of that specific bootcamp
    if (req.params.bootcampId) {
        const data = await CoursesModel.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } else {
        // getting all the courses here
        res.status(200).json(res.advanceQuery);
    }
});

// @desc   get single Courses
// @routes GET /api/courses/:id
// @Access PRIVATE
exports.getSingleCourse = asyncHandler(async(req, res, next) => {
    // getting the single course here
    const course = await CoursesModel.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description"
    });

    if (!course) {
        // this is static error only
        return next(new errorR(`No course found of id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc   Add single Courses
// @routes POST /api/bootcamps/:bootcampId/courses
// @Access PRIVATE
exports.addCourse = asyncHandler(async(req, res, next) => {
    // setting the req.body data here
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    // finding the bootcamp here
    const bootcamp = await bootcampModel.findById(req.params.bootcampId);

    if (!bootcamp) {
        // this is static error only
        return next(
            new errorR(`No bootcamp found of id ${req.params.bootcampId}`, 404)
        );
    }

    // adding the course here
    const course = await CoursesModel.create(req.body);

    res.status(200).json({
        success: true,
        message: "Course Added",
        data: course
    });
});

// @desc   Update single Courses
// @routes patch /api/courses/:id
// @Access PRIVATE
exports.updateCourse = asyncHandler(async(req, res, next) => {
    // finding the course here
    let course = await CoursesModel.findById(req.params.id);

    if (!course) {
        // this is static error only
        return next(
            new errorR(
                `No course found of id ${req.params.bootcampId} to update`,
                404
            )
        );
    }

    // updating the course here
    course = await CoursesModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: "Course Updated",
        data: course
    });
});

// @desc   delete single Courses
// @routes DELETE /api/courses/:id
// @Access PRIVATE
exports.deleteCourse = asyncHandler(async(req, res, next) => {
    // finding the course here
    const course = await CoursesModel.findById(req.params.id);

    if (!course) {
        // this is static error only
        return next(
            new errorR(
                `No course found of id ${req.params.bootcampId} to delete`,
                404
            )
        );
    }

    // delete the course here
    await course.remove();

    res.status(200).json({
        success: true,
        message: "Course deleted",
        data: {}
    });
});