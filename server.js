const express = require("express");
const mongoose = require("mongoose");
const app = express();
const config = require("./config/db");

app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Connect to MongoDB
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
