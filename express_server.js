var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

app.get("/urls", (req, res) => {
  let templateVars = { URLs: URLDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");
});

app.get("/u/:shortURL", (req, res) => {
  var longURL = URLDatabase[req.params.shortURL];
  if (req.params.shortURL in URLDatabase) {
    res.redirect(longURL);
  } else {
    res.sendStatus(302); // Don't think this works
  }
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = URLDatabase[shortURL]
  if (longURL) {
    let templateVars = { shortURL: shortURL, longURL: longURL};
    res.render("urls_show", templateVars);
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
  console.log("delete", req.params.id)
  delete URLDatabase[req.params.id];
  res.redirect("/urls") //not sure this works either
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

