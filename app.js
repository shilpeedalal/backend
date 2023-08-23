require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require('cors')

const User = require("./model/user");
const auth = require("./middleware/auth");

const app = express();

app.use(cors())

app.use(express.json({ limit: "50mb" }));

app.post("/register", async (req, res) => {
  try {

    const { name, dob, email, password } = req.body;

    if (!(email && password && name && dob)) {
      res.status(400).send("All input is required");
    }
    
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    let user = {};
    user = await User.create({
      name,
      dob,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    let token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );

    console.log("token :",token, Object.isFrozen(user));

    user.token = token;

    console.log("user :",user);

    return res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      
      user.token = token;

      res.status(200).json(user);
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
  }
});

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});


app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
