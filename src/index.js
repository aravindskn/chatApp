const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 5000;

const app = express();

const publicPathDir = path.join(__dirname, "../public");

app.use(express.static(publicPathDir));

app.get("", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => console.log("Server running on PORT:", PORT));
