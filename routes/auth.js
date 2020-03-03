// loading the controllers here
const {
    register,
    login,
    getUser,
    forgotPassword,
    resetPassword,
    updateUser,
    updatePassword,
    logoutUser
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = require("express").Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(protect, getUser);
router.route("/forgot").post(forgotPassword);
router.route("/resetPassword/:resetToken").put(resetPassword);
router.route("/updateUser").put(protect, updateUser);
router.route("/updatePassword").put(protect, updatePassword);
router.get("/logout", logoutUser)

module.exports = router;