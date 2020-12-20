const express = require("express"),
  bodyParser = require("body-parser"),
  expressSanitizer = require("express-sanitizer"),
  mongoose = require("mongoose"),
  app = express();

//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));

//MONGODB/MONGOOSE CONFIG
mongoose.connect("mongodb://localhost:27017/blogII", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const blogSchema = mongoose.Schema({
  title: String,
  image: { type: String, default: "download.png" },
  body: String,
  created: { type: Date, default: Date.now },
});
const Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//   title: "Cute pup",
//   image:
//     "https://images.unsplash.com/photo-1590508292979-a30664cfdb51?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60",
//   body: "This is a nice cute lil pup!",
// });

//RESTFUL ROUTES
app.get("/", (req, res) => {
  res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", (req, res) => {
  Blog.find()
    .then((blogs) => {
      res.render("index", { blogs: blogs });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/blogs/new", (req, res) => {
  res.render("new");
});

//MIDDLEWARE - CUSTOM MADE, handles potential time delay for next
//request to be answered(in case req.body.blog doesn't exist)
//(or it does and where to go next?)(handled using next();)
//EXPRESS SANITIZER USED IN MIDDLEWARE
app.use((req, res, next) => {
  if (req.body) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    next();
  } else {
    next();
  }
});

app.post("/blogs", (req, res) => {
  Blog.create(req.body.blog).then((newBlog) => {
    res.redirect("/blogs").catch((err) => {
      console.log(err);
      res.redirect("/blogs/new");
    });
  });
});

app.listen("4200", () => {
  console.log("Server up and running on port 4200");
});
