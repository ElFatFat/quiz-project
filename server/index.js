const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(5001, () => {
  console.log('Server is running on http://localhost:5001');
});