const router = require("express").Router({ mergeParams: true });

// loading the controllers here
const {
    getCourses,
    getSingleCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/courses");

// token verify middleware her
const { protect, authorize } = require("../middleware/auth");

const advanceQuery = require("../middleware/advanceQuery");
const courseModel = require("../models/Courses");
router
    .route("/")
    .get(
        advanceQuery(courseModel, {
            path: "bootcamp",
            select: "name description"
        }),
        getCourses
    )
    .post(protect, authorize("publisher", "admin"), addCourse);

router
    .route("/:id")
    .get(getSingleCourse)
    .patch(protect, authorize("publisher", "admin"), updateCourse)
    .delete(protect, authorize("publisher", "admin"), deleteCourse);

module.exports = router;