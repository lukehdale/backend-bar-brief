const User = require("../models/User");

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to fetch user" });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const { place } = req.body;

    if (!place) {
      return res.status(400).json({ message: "place_id is required" });
    }

    if (user.favorites.includes(place)) {
      return res.status(400).json({ message: "Bar is already in favorites" });
    }

    user.favorites.push(place);
    await user.save();

    res.status(200).json({
      message: "Favorite added successfully",
      favorites: user.favorites,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to add favorite" });
  }
};
