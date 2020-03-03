// loading the controllers here
const {
    getAllBootcampers,
    createSingleBootcamper,
    getSingleBootcamper,
    updateSingleBootcamper,
    deleteSingleBootcamper,
    getBootcamperWithRadius,
    bootcampUpload
} = require("../controllers/bootcampers");

// token verify middleware her
const { protect, authorize } = require("../middleware/auth");

// advancequery middleware
const advanceQuery = require("../middleware/advanceQuery");
const bootcampModel = require("../models/Bootcampers");

// include other resource router
const courseRouter = require("./courses");
const reviewRouter = require("./review");

const router = require("express").Router();

// re-route into other resources
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/review", reviewRouter);

router.route("/radius/:zipcode/:distance").get(getBootcamperWithRadius);

router
    .route("/")
    .get(advanceQuery(bootcampModel, "courses"), getAllBootcampers)
    .post(protect, authorize("publisher", "admin"), createSingleBootcamper);

router
    .route("/:id")
    .get(getSingleBootcamper)
    .patch(protect, authorize("publisher", "admin"), updateSingleBootcamper)
    .delete(protect, authorize("publisher", "admin"), deleteSingleBootcamper);

router
    .route("/:id/upload")
    .patch(protect, authorize("publisher", "admin"), bootcampUpload);

module.exports = router;