const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var app = express()
  app.use(express.json());
  app.use(express.urlencoded({extended:false}));
  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
  app.get('/', (req, res) => res.render('pages/index'))
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

const { Pool } = require("pg");
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:{
    rejectUnauthorized: false
  }
  // for the local host
  // connectionString: 'postgres://postgres:123wzqshuai@localhost/rectangle' 
})



app.post('/signUp', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;
  var inputRepeatPswd = req.body.repeatPswd;

  try {
    await pool.query(`INSERT INTO usrs (umail, upswd)
    VALUES ('${inputEmail}', '${inputPswd}')`);
    res.redirect('/userlogin.html');
  }
  catch (error) {
    res.end(error);
  }
})

/** change database name "users"; column name "uname", "psw"; "homepage" ...*/
app.post('/userlogin', async(req,res) => {
  var uname = req.body.uname;
  var password = req.body.psw;
  const data = result.rows;

  //search database using uname
  const result = await SecurityPolicyViolationEvent.query("SELECT * FROM users WHERE uname='" + uname + "';");

  //If username is not unique
  if (data.length > 1) {
    console.log("DUPLICATE USERS!!!");
  } 
  //If usename and password are correct, direct to homepage
  else if (data.length == 1 && password == data[0].psw) {
    res.render('pages/homepage', data[0])
  } 
  
  //If user does not exist or password is incorrect, alert user
  else if (data.length == 0 || password != data[0].psw) {
    window.alert("incorrect username or password");
  } 
})

app.post('/adminlogin', async(req,res) => {
  var uname = req.body.uname;
  var password = req.body.psw;
  const data = result.rows;

  //search database using uname
  const result = await SecurityPolicyViolationEvent.query("SELECT * FROM users WHERE uname='" + uname + "';");

  //If username is not unique
  if (data.length > 1) {
    console.log("DUPLICATE USERS!!!");
  } 
  //If usename and password are correct, direct to homepage
  else if (data.length == 1 && password == data[0].psw && data[0].authority == true) {
    res.render('pages/homepage', data[0])
  } 
  
  //If user does not exist or password is incorrect, alert user
  else if (data.length == 0 || password != data[0].psw || data[0].authority != true) {
    window.alert("incorrect username or password");
  } 
})
