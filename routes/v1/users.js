var express = require("express");
var router = express.Router();
var User = require("../../models/user");
var auth = require("../../modules/auth");

router.get("/", auth.verifyToken, (req, res) => {
  res.json({ email: req.user.email, token: req.user.token });
});

router.post("/", async (req, res) => {
  try {
    var user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

router.post("/login", async (req, res) => {
  var { email, password } = req.body;
  try {
    var user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "this email isnt registered" });
    var result = await user.verifyPassword(password);
    if (!result) return res.status(400).json({ error: "wrong password" });
    var token = await auth.generateJWT(user);
    res.json({ success: true, token });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
