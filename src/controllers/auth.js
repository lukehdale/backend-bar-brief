const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.signUp = async (req, res, next) => {
  const { name, username, email, password } = req.body;
  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: hashedPw,
    });
    await newUser.save();
    res.status(201).json({ message: "user created", newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  let loadedUser;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      const error = new Error("User with this email already exists");
      error.statuscode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        username: loadedUser.username,
        userId: loadedUser._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600000,
    });
    res.status(200).json({ token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
