// model here
const reviewModel = require("../models/Reviews");
const bootcampModel = require("../models/Bootcampers");
const errorR = require("../utils/errorRESP");
const asyncHandler = require("../middleware/async");

// @desc   get all the reviews of bootcamp
// @routes GET /api/review
// @routes GET /api/bootcamps/:bootcampId/review
// @Access PUBLIC
exports.getReviews = asyncHandler(async(req, res, next) => {
    // getting the courses of that specific bootcamp
    if (req.params.bootcampId) {
        const review = await reviewModel.find({ bootcamp: req.params.bootcampId });


        return res.status(200).json({
            success: true,
            count: review.length,
            review
        });
    } else {
        // getting all the courses here
        res.status(200).json(res.advanceQuery);
    }
});


// @desc   get single the review of bootcamp
// @routes GET /api/review/:id
// @Access PUBLIC
exports.getSingleReview = asyncHandler(async(req, res, next) => {

    const review = await reviewModel.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if (!review) {
        return next(new errorR(`NO review available of that id`, 404));
    }

    res.status(200).json({
        success: true,
        review
    });
});



// @desc   add review of bootcamp
// @routes POST /api/bootcamp/:bootcampId/review
// @Access PRIVATE
exports.addReview = asyncHandler(async(req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;


    const bootcamp = await bootcampModel.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new errorR(`NO Bootcamp of that id here`, 404));
    }

    const review = await reviewModel.create(req.body);

    res.status(200).json({
        success: true,
        review
    });



});



// @desc   update review of bootcamp
// @routes PUT /api/review/:id
// @Access PRIVATE
exports.updateReview = asyncHandler(async(req, res, next) => {

    let review = await reviewModel.findById(req.params.id);

    if (!review) {
        return next(new errorR(`NO Review to update`, 404));
    }


    // check  if same use updating it
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errorR(`NOT Authorize to access this route`, 404));
    }

    review = await reviewModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        review
    });
});


// @desc   Delete review of bootcamp
// @routes DELTE /api/review/:id
// @Access PRIVATE
exports.deleteReview = asyncHandler(async(req, res, next) => {

    let review = await reviewModel.findById(req.params.id);

    if (!review) {
        return next(new errorR(`NO Review to update`, 404));
    }


    // check  if same use updating it
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errorR(`NOT Authorize to access this route`, 404));
    }

    await reviewModel.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});