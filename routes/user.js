const router = require("express").Router({ mergeParams: true });

// loading the controllers here
const {
    getAllUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/user");

const userModel = require("../models/User");

// token verify middleware her
const { protect, authorize } = require("../middleware/auth");

// advancequery middleware
const advanceQuery = require("../middleware/advanceQuery");

// using the middleware here
router.use(protect);
router.use(authorize("admin"));

router
    .route("/")
    .get(advanceQuery(userModel), getAllUsers)
    .post(createUser);
router
    .route("/:id")
    .get(getSingleUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;