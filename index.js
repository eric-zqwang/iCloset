const express = require('express');
const path = require('path')
const session = require("express-session")
const PORT = process.env.PORT || 5000

var app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${PORT}`))

const { Pool } = require("pg");
var pool;
pool = new Pool({
  // connectionString: process.env.DATABASE_URL,
  // ssl:{
  //   rejectUnauthorized: false
  // }


  // for the local host
  connectionString: 'postgres://postgres:123wzqshuai@localhost/users' 
})



app.post('/signUp', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;


  var result = pool.query(`SELECT * from usrs where umail = '${inputEmail}'`)
  if (!result){
    res.send("The register email already exist")

  }
  else{
    try {
      await pool.query(`INSERT INTO usrs (umail, upswd)
      VALUES ('${inputEmail}', '${inputPswd}')`);
      res.redirect('/userlogin.html');
    }
    catch (error) {
      res.send("User NAME ALREADY EXISTS");
    }
  }
})

/** change database name "users"; column name "uname", "psw"; "homepage" ...*/
app.post('/userlogin', async (req, res) => {
  var uname = req.body.uname;
  var password = req.body.psw;

  //search database using uname
  const result = await SecurityPolicyViolationEvent.query("SELECT * FROM userInfo WHERE umail='" + uname + "';");

  const data = { results: result.rows };

  //If username is not unique
  if (data.length > 1) {
    console.log("DUPLICATE USERS!!!");
  }
  //If usename and password are correct, direct to homepage
  else if (data.length == 1 && password == data[0].psw) {
    res.render('pages/db', data[0])
  }

  //If user does not exist or password is incorrect, alert user
  else if (data.length == 0 || password != data[0].psw) {
    window.alert("incorrect username or password");
  }
})

app.post('/userlogout', async(req,res) => {
  if(req.body.session.user) {
    res.session.destory;
  }
  res.redirect('/userlogin.html');
})



app.post('/adminlogin', async(req,res) => {
  var uname = req.body.uname;
  var password = req.body.psw;
  const data = result.rows;
  
  //search database using uname
  const result = await SecurityPolicyViolationEvent.query("SELECT * FROM userInfo WHERE umail='" + uname + "';");
  
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


//upload image
const multer = require('multer');
const { redirect } = require('express/lib/response');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })
app.use('/uploads', express.static('uploads'));
app.post('/uploadImage', upload.single('upImg'), async (req, res) => {
  // debug use
  // console.log(JSON.stringify(req.file))
  // var response = '<a href="pages/homepage">back to home page</a><br>'
  // response += "Files uploaded successfully.<br>"
  // response += `<img src="${req.file.path}"  width="200" height="200"/><br>`
  // response += `${req.file.path}`;
  await pool.query(`insert into userobj1 (images) values (lo_import('${__dirname}\\${req.file.path}'))`);
  const result = await pool.query(`select * from userobj1`);
  const data = { results: result.rows };
  res.render('pages/homepage', data);
  //res.redirect('uploadimg.html');
})