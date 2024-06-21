const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// Update user
router.put("/:id", async (req, res) => {
  try {
    // Check permissions
    if (!(req.body.userId === req.params.id || req.body.isAdmin)) {
      return res.status(403).json("You can only update your account");
    }

    // Hash password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Update user data
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!user) {
      return res.status(404).json("User not found");
    }

    // Respond with success message
    res.status(200).json("Account has been updated");
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json("Server Error");
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    // Check permissions
    if (!(req.body.userId === req.params.id || req.body.isAdmin)) {
      return res.status(403).json("You can only delete your account");
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json("User not found");
    }

    // Respond with success message
    res.status(200).json("Account has been deleted");
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json("Server Error");
  }
});

//Get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Follow a user
router.put("/:id/follow", async (req, res) => {
  const userId = req.body.userId;
  const id = req.params.id;

  if (userId === id) {
    return res
      .status(403)
      .json("You cannot follow yourself");
  }

  try {
    const user = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!user || !currentUser) {
      return res
        .status(404)
        .json("User not found" );
    }

    if (user.followers.includes(userId)) {
      return res
        .status(403)
        .json("You already follow this user" );
    }

    await user.updateOne({ $push: { followers: req.body.userId } });
    await currentUser.updateOne({ $push: { followings: req.params.id } });

    res.status(200).json("User is followed");
  } catch (err) {
    res.status(500).json({err});
  }
});

//Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    const userId = req.body.userId;
    const id = req.params.id;
  
    if (userId === id) {
      return res.status(403).json("You cannot unfollow yourself");
    }
  
    try {
      const user = await User.findById(id);
      const currentUser = await User.findById(userId);
  
      if (!user || !currentUser) {
        return res.status(404).json("User not found");
      }
  
      if (!user.followers.includes(userId)) {
        return res.status(403).json("You are not following this user");
      }
  
      // Perform updates atomically
      await Promise.all([
        user.updateOne({ $pull: { followers: userId } }),
        currentUser.updateOne({ $pull: { followings: id } })
      ]);
  
      res.status(200).json("User is unfollowed");
    } catch (err) {
      console.error("Error in unfollow operation:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  
module.exports = router;
