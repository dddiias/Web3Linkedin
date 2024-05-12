const express = require("express");
const path = require("path");

const app = express();
const port = 3000;
app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("connect_wallet");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
