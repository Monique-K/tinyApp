const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const bcrypt = require('bcrypt');
const saltRounds = 10;
cookieSession = require('cookie-session')
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ["blah blah"],
  maxAge: 24 * 60 * 60 * 1000
}))

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

function urlsForUser(id) {
  let currentUserURLS = {};
  for (shortURL in URLDatabase) {
    if (id === URLDatabase[shortURL].user_id) {
    currentUserURLS[shortURL] = URLDatabase[shortURL];
  }
 }
 return currentUserURLS;
};

const URLDatabase = {
  "b2xVn2": {shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca", user_id: "user2RandomID"},
  "9sm5xK": {shortURL: "9sm5xK", longURL: "http://www.google.com", user_id: "user3RandomID"},
  "asdf12": {shortURL: "asdf12", longURL: "http://www.facebook.com", user_id: "user3RandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: bcrypt.hashSync("best-app-ever", 10)
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: bcrypt.hashSync("a", 10)
  }
};

console.log(bcrypt.hashSync("purple-monkey-dinosaur", 10));

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

//get main url list page with only the user's URLs
app.get("/urls", (req, res) => {
  let usersURLs = urlsForUser(req.session.user_id)
  let templateVars = { URLs: usersURLs, user: users[req.session.user_id]};
  if (req.session.user_id) {
      return res.render("urls_index", templateVars);
    } else {
      res.redirect("/login");
    }
});

//get new url page
app.get("/urls/new", (req, res) => {
    res.render("urls/new", templateVars);
});

//add the new url to the main pg
app.post("/urls", (req, res) => {
  URLDatabase[generateRandomString()] = req.body.longURL
  res.redirect('/urls');
});

//use shortURL to reach webpage
app.get("/u/:shortURL", (req, res) => {
  var longURL = URLDatabase[req.params.shortURL].longURL;
  if (req.params.shortURL in URLDatabase) {
    res.redirect(longURL);
  } else {
    res.sendStatus(302);
  }
});

//get registration page
app.get("/register", (req, res) => {
  res.render("register");
});

//register - post user credentials to /register & add new user to the db
app.post('/urls/register', (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    var idString = generateRandomString();
    if (req.body.email === "" || req.body.password === "") {
      res.sendStatus(400)
    } else {
      var regristrationRejection = false;
      for (user in users) {
        if (users[user].email === req.body.email) {
          regristrationRejection = true;
        }
      }
      if (regristrationRejection) {
        res.sendStatus(400)
      } else {
        users[idString] = {
          id: idString,
          email: req.body.email,
          password: hashedPassword
        }
        req.session.user_id = "idString"
        res.redirect("/urls")
      }
    }
});

//login only with existing username and password
app.post('/login', (req, res) => {
    if (req.body.email === "" || req.body.password === "") {
      res.sendStatus(400)
      return
    } else {
      let userFound = false;
      const userArray = Object.values(users)
      userArray.forEach(function(user) {
        if (user.email === req.body.email && bcrypt.compareSync(req.body.password, user.password)) {
          userFound = user;
        }
      })
      if (userFound) {
        req.session.user_id = "idString"
        res.redirect('/urls')
      } else {
        res.sendStatus(404);
      }
    }
});

//get login pg
app.get("/login", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("login", templateVars);
});

//logout
app.post("/logout", (req, res) => {
  req.session = null; //-------------------------------
  res.redirect("login");
});

//update a longurl and redirect to main pg
app.post('/urls/:id', (req, res) => {
    if (req.session.user_id === URLDatabase[req.params.id].user_id) {
      URLDatabase[req.params.id] = req.body.longURL;
      res.redirect("/urls")
    }else {
      res.sendStatus(404);
    }
});

//delete a user and reload the pg
app.post('/urls/:id/delete', (req, res) => {
  delete URLDatabase[req.params.id];
  res.redirect("/urls")
});

//go to the individual _show pg
app.get("/urls/:id", (req, res) => {
  let usersURLs = urlsForUser(req.session.user_id)
  let shortURL = req.params.id
  let longURL = URLDatabase[shortURL]
  if (usersURLs.user_id !== req.session.user_id) {
    res.send({ message: 'Sorry, this URL does not belong to you!' });
    res.sendStatus(404);
  }else if (longURL) {
    let templateVars = { shortURL: shortURL, longURL: longURL, user: users[req.session.user_id]};
    res.render("/urls_show", templateVars);
  } else {
    res.sendStatus(404);
  }
})






