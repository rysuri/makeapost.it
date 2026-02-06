const express = require("express");
const router = express.Router();
const { googleAuth } = require("../auth/auth");
const { verify } = require("../auth/verify");
const { logout } = require("../auth/logout");

router.post("/google", googleAuth);
router.post("/verify", verify);
router.post("/logout", logout);
module.exports = router;
