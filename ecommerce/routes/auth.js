const express = require("express");
const router = express.Router();

const {
    signout,
    signup,
    signin,
    requireSignin,
} = require("../controllers/auth");
const { userSignupValidator } = require("../validator");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

module.exports = router;