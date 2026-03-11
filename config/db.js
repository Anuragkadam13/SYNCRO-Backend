const mongoose = require("mongoose");

const connectToMongo = () => {
  console.log(
    "Attempting to connect to MongoDB with URI:",
    process.env.MONGO_URI,
  );

  return mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};

module.exports = connectToMongo;
