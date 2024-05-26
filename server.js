const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const indexRouter = require("./routes/index");
const postsRouter = require("./routes/posts");

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
