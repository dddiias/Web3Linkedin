const express = require("express");
const path = require("path");
<<<<<<< HEAD
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const indexRouter = require("./routes/index");
const postsRouter = require("./routes/posts");
=======
>>>>>>> 2b2f0cb63955cbd24c7b08c51ff10e56f7b276cb

const app = express();
const port = 3000;

<<<<<<< HEAD
mongoose.connect(
  "mongodb+srv://boypurple60:diasiksal2003@cluster0.5tae3te.mongodb.net/web3Linkedin",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://boypurple60:diasiksal2003@cluster0.5tae3te.mongodb.net/web3Linkedin",
    }),
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", indexRouter);
app.use("/posts", postsRouter);
=======
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("connect_wallet");
});
>>>>>>> 2b2f0cb63955cbd24c7b08c51ff10e56f7b276cb

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
