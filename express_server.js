var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set("view engine", "ejs");


var URLDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "asdf12": "www.facebook.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(URLDatabase);
});

app.get("/urls", (req, res) => { //get main db page
  let templateVars = { URLs: URLDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { //get new url page
  let templateVars = {
  username: req.cookies["username"],
};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => { //add the new url to the main pg
  console.log(req.body);
  URLDatabase[generateRandomString()] = req.body.longURL
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  var longURL = URLDatabase[req.params.shortURL];
  if (req.params.shortURL in URLDatabase) {
    res.redirect(longURL);
  } else {
    res.sendStatus(302);
  }
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = URLDatabase[shortURL]
  if (longURL) {
    let templateVars = { shortURL: shortURL, longURL: longURL, username: req.cookies["username"]};
    res.render("urls_show", templateVars); //go to page for that url
    console.log(shortURL);
  } else {
    res.sendStatus(404);
  }
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post('/urls/:id/delete', (req, res) => {
  console.log("delete", req.params.id) //delete a user and reload the pg
  delete URLDatabase[req.params.id];
  res.redirect("/urls")
});

app.post('/urls/:id', (req, res) => { //update a longurl and redirect to main pg
    console.log("body", req.body);
    URLDatabase[req.params.id] = req.body.longURL;
    res.redirect("/urls")
});

app.post('/login', (req, res) => { //create a cookie with username, let user log in
  res.cookie("username", req.body.username)
});

app.get('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
});



function generateRandomString() {
  let randomArray = []
  let choices ="qwertyuioplkjhgfdsazxcvbnm1234567890"
  for (let i = 0; i < 6; i ++) {
    let randomchoice = Math.floor(Math.random() * 37);
    randomArray.push(choices[randomchoice]);
    randomString = randomArray.join("");
  }
  return randomString;
}

