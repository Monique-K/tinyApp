var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set("view engine", "ejs");

function generateRandomString() {
  let randomArray = []
  let choices ="qwertyuioplkjhgfdsazxcvbnm1234567890"
  for (let i = 0; i < 6; i ++) {
    let randomchoice = Math.floor(Math.random() * 37);
    randomArray.push(choices[randomchoice]);
    randomString = randomArray.join("");
  }
  return randomString;
};

var URLDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "asdf12": "www.facebook.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "best-app-ever"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: " "
  }
};

// var authenticateUser = (req, res, next) => {
//   if(req.cookies.user_id) {
//     //find it in obj
//     next()
//   } else {
//     res.redirect('/login')
//   }
// }

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(URLDatabase);
});

//get main db page
app.get("/urls", /*authenticateUser,*/ (req, res) => {
  let templateVars = { URLs: URLDatabase, user: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

//get new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {
  user: req.cookie.users[idString],
};
  res.render("urls_new", templateVars);
});

//add the new url to the main pg
app.post("/urls", (req, res) => {
  URLDatabase[generateRandomString()] = req.body.longURL
  res.redirect('/urls');
});

//use shortURL to reach webpage
app.get("/u/:shortURL", (req, res) => {
  var longURL = URLDatabase[req.params.shortURL];
  if (req.params.shortURL in URLDatabase) {
    res.redirect(longURL);
  } else {
    res.sendStatus(302);
  }
});

//go to the individual _show pg
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = URLDatabase[shortURL]
  if (longURL) {
    let templateVars = { shortURL: shortURL, longURL: longURL, user: users[req.cookies.user_id]};
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(404);
  }
});

//get registration page
app.get("/register", (req, res) => {
  res.render("register", {user: {email: 'rob@thebrewbox.co'}});
});

//register - post user credentials to /register & add new user to the db
app.post('/urls/register', (req, res) => {
    var idString = generateRandomString();
    if (req.body.email === "" || req.body.password === "") {
      res.sendStatus(400)
    } else {
      var regristrationRejection = false;
      for (idString in users) {
        if (users[idString].email === req.body.email) {
          regristrationRejection = true;
        }
      }
      if (regristrationRejection) {
        res.sendStatus(400)
      } else {
        users[idString] = {
          id: idString,
          email: req.body.email,
          password: req.body.password
        }
        res.cookie("user_id", idString)
        res.redirect("/urls")
      }
    }
});

//login
app.post('/login', (req, res) => {
    if (req.body.email === "" || req.body.password === "") {
      res.sendStatus(400)
      return
    } else {
      const userArray = Object.values(users)
      userArray.forEach(function(user) {
        if (user.email === req.body.email && user.password === req.body.password) {
          res.cookie('user_id', user.id)
          res.redirect('/')
          return
        }
      })
    }
    res.sendStatus(400)
});

//get login pg
app.get("/login", (req, res) => {
  let templateVars = {user: users[req.cookies.user_id]};
  res.render("login", templateVars);
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("login");
});

//update a longurl and redirect to main pg
app.post('/urls/:id', (req, res) => {
    URLDatabase[req.params.id] = req.body.longURL;
    res.redirect("/urls")
});

//delete a user and reload the pg
app.post('/urls/:id/delete', (req, res) => {
  delete URLDatabase[req.params.id];
  res.redirect("/urls")
});



