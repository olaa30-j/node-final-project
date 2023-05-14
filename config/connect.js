const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/blog')
  .then(() => {
    console.log("Connected to the MongoDB database");
  })
  .catch((error) => {
    console.error("Failed to connect to the MongoDB database:", error);
  });
