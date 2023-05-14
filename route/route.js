const express = require('express');
const cors = require('cors');
const Use = require('../models/user');
const blogs = require('../models/blog'); // Unused variable

const path = require('path');
const multer = require('multer');
const date = require('date-and-time');

// Configure multer for file storage
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    console.log(req, file);
    callback(null, 'Home/assets/images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname.replaceAll(" ", ""));
  }
});

const cookieParser = require('cookie-parser');
const upload = multer({ storage: fileStorage });
const route = express.Router();

const jwt = require('jsonwebtoken');
const key = "test";

// Serve static files from different directories
route.use(express.static(path.join(__dirname, '../Login')));
route.use(express.static(path.join(__dirname, '../Home')));
route.use(express.static(path.join(__dirname, '../Signup')));

route.use(express.urlencoded({ extend: true })); // Parse URL-encoded bodies
route.use(express.json()); // Parse JSON bodies
route.use(cookieParser());

// Handle registration form
route.get('/register', async function (req, res) {
  let pathfile = path.join(__dirname, '../Signup/Signup.html');
  res.sendFile(pathfile);
});

route.post('/register', async function (req, res) {
  // Create a new user
  let us = await Use.create({
    userName: req.body.name,
    password: req.body.pass,
    email: req.body.email,
  });
  res.redirect('/user/login');
});

// Handle login form
route.get('/login', async function (req, res) {
  let pathfile = path.join(__dirname, "../Login/login.html");
  res.sendFile(pathfile);
});

route.post('/login', async function (req, res) {
  // Find user by email and password
  let us = await Use.findOne({
    password: req.body.pass,
    email: req.body.email,
  });

  if (us) {
    // Generate a JWT token
    let payload = { userId: us._id };
    let token = jwt.sign(payload, key);

    // Set the token as a cookie and redirect to the home page
    res.cookie('token', token, { maxAge: 900000, httpOnly: true });
    res.redirect("/user/home");
  }
});


// Home route for initializing CSS and JS files for assets
route.get('/home', async function (req, res) {
  let pathfile = path.join(__dirname, `../Home/index.html`);
  res.sendFile(pathfile);
});

route.get('/home/:search', async function (req, res) {
  let pathfile = path.join(__dirname, `../Home/index.html`);
  res.sendFile(pathfile);
});

route.get('/profile', async function (req, res) {
  let pathfile = path.join(__dirname, `../Home/profile.html`);
  res.sendFile(pathfile);
});

// Get all blogs in home
route.get('/blogs', async function (req, res) {
  let blogsData = await blogs.find({});
  res.send(blogsData);
});

// Select blogs that belong to the logged-in user
route.get('/blogs/pro', async function (req, res) {
  console.log(req.cookies);
  let blogsData = await blogs.find({});
  res.send(blogsData);
});

// Add blog
route.post('/addblog', upload.single('image'), async function (req, res) {
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var now = new Date();
  let time = now.toLocaleDateString('en-US', options);
  console.log(time);
  
  let decoded = jwt.verify(req.cookies.token, key);
  let user = await Use.findOne({ _id: decoded.userId });
  
  let blog = await blogs.create({
    title: req.body.title,
    description: req.body.description,
    tags: req.body.tags,
    image: req.file.filename,
    publisher: user,
    date: time
  });
  
  res.redirect('/user/home');
});

// Get blogs by user id
route.get('/blog/:user_id', async function (req, res) {
  let blogsData = await blogs.find({ 'publisher._id': req.params.user_id });
  res.send(blogsData);
});

// Delete blog
route.delete('/delete/:id', async function (req, res) {
  let deletedBlog = await blogs.deleteOne({ '_id': req.params.id });
  res.redirect('/user/profile');
});

// Get blog by id
route.get('/blogs/:id', async function (req, res) {
  try {
    const blog = await blogs.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Update blog by ID
route.post('/update', async function(req, res) {
  try {
    console.log(req.body.title);
    const updatedBlog = await blogs.findOneAndUpdate(
      { _id: req.body.idd },
      {
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags
      },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    } else {
      res.redirect("/user/profile");
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Search
route.post('/search', async (req, res) => {
  console.log(req.body.title);

  const blog = await blogs.find({
    $or: [
      { title: { $regex: req.body.title, '$options': 'i' } },
      { description: { $regex: req.body.title, '$options': 'i' } },
      { 'publisher.userName': { $regex: req.body.title, '$options': 'i' } }
    ]
  });

  res.send(blog);
});

module.exports = route;
