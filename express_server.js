const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser")
app.use(cookieParser())
const bcrypt = require("bcrypt");
const saltRounds = 10;
cookieSession = require("cookie-session")
app.set("view engine", "ejs");

app.use(cookieSession({
  name: "session",
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
  "asdf12": {shortURL: "asdf12", longURL: "http://www.facebook.com", user_id: "user5RandomID"}
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
  },
  "user5RandomID": {
    id: "user5RandomID",
    email: "a@a.com",
    password: bcrypt.hashSync("a", 10)
  }
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  if (req.session) {
    res.redirect("/login");
  } else {
    res.redirect("/register");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(URLDatabase);
});

//get main url list page with only the user"s URLs
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
  let usersURLs = urlsForUser(req.session.user_id)
  let templateVars = {URLs: usersURLs, user: users[req.session.user_id]};
      return res.render("urls_index", templateVars);
    } else {
      res.redirect("/login");
    }
});

//get new url page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return
  } else {
    let usersURLs = urlsForUser(req.session.user_id)
    let templateVars = {URLs: usersURLs, user: users[req.session.user_id], session: req.session};
    res.render("urls_new", templateVars);
  }
});

//add the new url to the main pg
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  URLDatabase[randomString] = {shortURL: randomString, longURL: req.body.longURL, user_id: req.session.user_id}
  res.redirect("/urls");
});

//use shortURL to reach webpage
app.get("/u/:shortURL", (req, res) => {
  let longURL = URLDatabase[req.params.shortURL].longURL;
  if (req.params.shortURL in URLDatabase) {
    res.redirect(longURL);
  } else {
    let templateVars = {errorMsg: "Incorrect short URL. Please try again."}
    res.status(302);
    res.render("errors", templateVars);
  }
});

//get registration page
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("register", templateVars);
});

//register - post user credentials to /register & add new user to the db
app.post("/urls/register", (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    letidString = generateRandomString();
    if (req.body.email === "" || req.body.password === "") {
      let templateVars = {errorMsg: "Please enter an email and password."}
      res.status(400);
      res.render("errors", templateVars);
    } else {
      var regristrationRejection = false;
      for (user in users) {
        if (users[user].email === req.body.email) {
          regristrationRejection = true;
        }
      }
      if (regristrationRejection) {
        let templateVars = {errorMsg: "Please enter a valid email and password."}
        res.status(400);
        res.render("errors", templateVars);
      } else {
        users[idString] = {
          id: idString,
          email: req.body.email,
          password: hashedPassword
        }
        req.session.user_id = users[idString].id
        res.redirect("/urls")
      }
    }
});

//login only with existing username and password
app.post("/login", (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
    if (req.body.email === "" || req.body.password === "") {
      let templateVars = {errorMsg: "Please enter an email and password."}
      res.status(400);
      res.render("errors", templateVars);
      return
    } else {
      let userFound = false;
      const userArray = Object.values(users)
      userArray.forEach(function(user) {
        if (user.email === req.body.email && bcrypt.compareSync(req.body.password, user.password)) {
          userFound = user
        }
    })
      if (userFound) {
        req.session.user_id = userFound.id;
        res.redirect("/urls");
      } else {
        let templateVars = {errorMsg: "Please enter a valid email and password."}
        res.status(404);
        res.render("errors", templateVars);
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
  req.session = null;
  res.redirect("/login");
});

//update a longurl and redirect to main pg
app.post("/urls/:id", (req, res) => {
    if (req.session.user_id === users[req.session.user_id].id) {
      let shortURL = req.params.id;
      URLDatabase[shortURL] = {shortURL: shortURL, longURL: req.body.longURL, user_id: req.session.user_id}
      res.redirect("/urls");
    } else {
      let templateVars = {errorMsg: "Sorry, you can't update that URL."}
      res.status(404);
      res.render("errors", templateVars);
    }
});

//go to the individual _show pg if the user owns it
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {errorMsg: "Sorry, this URL does not belong to you."}
      res.status(404);
      res.render("errors", templateVars);
  } else {
    let usersURLs = urlsForUser(req.session.user_id);
    let shortURL = req.params.id;
    let longURL = URLDatabase[shortURL].longURL;
    let templateVars = { shortURL: shortURL, longURL: longURL, user: users[req.session.user_id]};
    res.render("urls_show", templateVars);
  }
});

//delete a user and reload the pg
app.post("/urls/:id/delete", (req, res) => {
  delete URLDatabase[req.params.id];
  res.redirect("/urls")
});




