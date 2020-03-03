const router = require("express").Router({ mergeParams: true });

// loading the controllers here
const {
    getReviews,
    getSingleReview,
    addReview,
    updateReview,
    deleteReview
} = require("../controllers/review");

// token verify middleware her
const { protect, authorize } = require("../middleware/auth");

const advanceQuery = require("../middleware/advanceQuery");
const reviewModel = require("../models/Reviews");
router
    .route("/")
    .get(
        advanceQuery(reviewModel, {
            path: "bootcamp",
            select: "name description"
        }),
        getReviews
    ).post(protect, authorize('user', 'admin'), addReview)

router.route('/:id').get(getSingleReview).put(protect, authorize('admin', 'user'), updateReview).delete(protect, authorize('user', 'admin'), deleteReview)


module.exports = router;