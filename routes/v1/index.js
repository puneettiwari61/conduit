var express = require("express");
var router = express.Router();
var userRouter = require("./users.js");
var Article = require("../../models/article");
var articleRouter = require("./articles");
var auth = require("../../modules/auth");
var User = require("./../../models/user");

router.get("/", function(req, res, next) {
  res.json({ index: true });
});

router.put("/protected", auth.verifyToken, (req, res) => {
  res.json({ protected: true });
});

//get current user
router.get("/user", auth.verifyToken, async (req, res) => {
  try {
    var user = await User.findById(req.user.userID, { password: false });
    // console.log(user);
    if (user == null) {
      return res.status(400).error("no user found");
    }
    // console.log(req.user)
    res.json({ user });
  } catch (error) {
    res.json({ error });
  }
});

//update user
router.put("/user", auth.verifyToken, async (req, res) => {
  try {
    var user = await User.findByIdAndUpdate(req.user.userID, req.body, {
      new: true
    });
    res.json({ user });
  } catch (error) {
    res.json({ error });
  }
});

// post user
// router.put('/user',auth.verifyToken,(req,res)=>{
//   console.log(req.body,"request")
// })

//get tags
router.get("/tags", async function(req, res) {
  try {
    var tags = await Article.find().distinct("tagList");
    res.json({ tags });
  } catch (error) {
    res.status(400).json(error);
  }
});

//get profile
router.get("/profiles/:username", async function(req, res) {
  try {
    var profile = await User.findOne(
      { username: req.params.username },
      { password: false }
    );
    if (!profile)
      return res.status(400).json({ noprofile: "profile dosent exist" });
    var currentUser = await User.findById(req.user.userID);
    // console.log(req.user.following)
    var following = currentUser.following.includes(profile.id);
    res.json({
      profile: {
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
        following: following
      }
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

//follow
router.post("/profiles/:username/follow", auth.verifyToken, async function(
  req,
  res
) {
  try {
    var profile = await User.findOne({ username: req.params.username });
    var currentUser = await User.findByIdAndUpdate(
      req.user.userID,
      { $push: { following: profile._id } },
      { new: true }
    );
    var following = await currentUser.following.includes(profile.id);
    res.json({
      profile: {
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
        following: following
      }
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

//unfollow
router.delete("/profiles/:username/follow", auth.verifyToken, async function(
  req,
  res
) {
  try {
    var profile = await User.findOne({ username: req.params.username });
    var currentUser = await User.findByIdAndUpdate(
      req.user.userID,
      { $pull: { following: profile._id } },
      { new: true }
    );
    var following = await currentUser.following.includes(profile.id);
    res.json({
      profile: {
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
        following: following
      }
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.use("/users", userRouter);
router.use("/articles", articleRouter);

module.exports = router;
