var express = require("express");
var path = require("path");
var http = require("http");
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer");

var app = express();

var port = process.env.PORT || 3001;

// setting up views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// middleware for bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//for sending email
//var sendEmail = require("./sendEmail");
//var sendEmail1 = require("./sendemailmain");

var firebase = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://test-8c3dc.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("restricted_access/secret_document");
ref.on("value", function(snapshot) {
  console.log(snapshot.val());
});

var usersRef = ref.child("users");
/*usersRef.set({
  alanisawesome: {
    email: "at@at.com",
    username: "Alan Turing"
  },
  gracehop: {
    email: "gh@gh.com",
    username: "Grace Hopper"
  }
});*/

var userInfoRef = ref.child("userInfo");

app.get("/", function(req, res) {
  res.render("index");
});

var updates = {};
var updatesinfo = {};

app.post("/", function(req, res) {
  var name = req.body.userName;
  var email = req.body.userEmail;
  console.log(name + email);

  var postData = {
    name,
    email
  };

  var newuser = usersRef.push().key;

  updates[newuser] = postData;
  updatesinfo[newuser] = postData;

  usersRef.update(updates);
  userInfoRef.update(updatesinfo);

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "<emailofsender>",
      pass: "<getapp_password>"
    }
  });

  let mailOptions = {
    from: "<emailofsender>", // sender address
    to: email, // list of receivers
    subject: "email test", // Subject line
    text: "Dear " + name + ", Welcome to our app" // plain text body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message %s sent: %s", info.messageId, info.response);
    res.render("sentemail");
  });
});

// setting up listen for server function
app.listen(port, function(err) {
  if (err) throw err;
  console.log("Server is running on port " + port);
});
