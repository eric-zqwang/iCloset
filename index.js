const express = require('express');
const path = require('path')
const session = require("express-session")
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000

var app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// redirect user to login page if they dont have a session
app.use(function(req, res, next) {
  if (curSession == null && (!req.path.endsWith("login") && !req.path.endsWith("signUp"))) {
    // if user is not logged-in redirect back to login page
    res.redirect('/userlogin.html');
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  if (curSession){
      res.render('pages/index');
    } else {
      res.redirect('/userlogin.html');
    }
});
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
app.use(cookieParser());

// add session 
app.use(session({
  name: "session",
  secret: 'top secret',
  resave: false, //Forces the session to be saved back to the session store
  saveUninitialized: false, //Forces a session that is "uninitialized" to be saved to the store
  maxAge: 60 * 60 * 1000, // 60 minutes
}))

const { Pool } = require("pg");
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:{
     rejectUnauthorized: false
  }
  // connectionString: process.env.DATABASE_URL,
  // ssl:{
  //   rejectUnauthorized: false
  // }
  // for local host
  // connectionString: 'postgres://nicoleli:12345@localhost/icloset' 
  
})

app.post('/signUp', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;

  var result = pool.query(`SELECT * FROM usrs WHERE umail = '${inputEmail}';`)
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

var curSession;
// regular user login, direct to homepage
app.post('/userlogin', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;
  
  // search database using umail
  const result = await pool.query(`SELECT * FROM usrs WHERE umail = '${inputEmail}';`);

  const data = { results: result.rows };

  //If umail is not unique
  if (data.results.length > 1) {
    console.log("DUPLICATE USERS!!!");
  }
  //If umail and password are correct, direct to homepage
  else if (data.results.length == 1 && inputPswd == data.results[0].upswd) {
    var user = {name:data.results[0].uname, password:data.results[0].upswd}
    req.session.user = user;
    curSession = req.session;

    res.render('pages/homepage', data);
  }

  //If umail does not exist or password is incorrect, alert user
  else if (data.results.length == 0 || inputPswd != data.results[0].upswd)  {
    console.log("incorrect login email or password");
  }
})

// admin login, direct to user-list
app.post('/adminlogin', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;

  // search database using umail
  const result = await pool.query(`SELECT * FROM usrs WHERE umail = '${inputEmail}';`);
  const data = { results: result.rows };

  //If umail is not unique
  if (data.results.length > 1) {
    console.log("user email not correct");
    }
  //If umail and password are correct and is admin, direct to user-list
  else if (data.results.length == 1 && inputPswd == data.results[0].upswd && data.results[0].admin == true) {
    var user = {name:data.results[0].uname, password:data.results[0].upswd}
    req.session.user = user;
    curSession = req.session;
    res.render('pages/user-list', data)
  }

  //If umail does not exist or password is incorrect, alert user
  else if (data.results.length == 0 || inputPswd != data.results[0].upswd) {
    console.log("incorrect login email or password");
  }
})

app.get('/userlogout', async(req,res) => {
  if(curSession) {
    curSession.destroy();
  }
  req.session.destroy();
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
const fs = require('fs')
const multer = require('multer');
const { redirect } = require('express/lib/response');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));
app.post('/uploadImage', upload.single('upImg'), async (req, res) => {
  function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString('base64');
  }
  var base64ImgData = base64Encode(req.file.path);
  await pool.query(`insert into userobj1 (txtimg) values ('${base64ImgData}')`);
  const result = await pool.query(`select * from userobj1`);
  const data = { results: result.rows };
  res.render('pages/homepage', data);
});

// user list
app.get('/user-list', (request, response) => {
    var page = request.query['page'] ? request.query['page'] : 1;
    var size = request.query['size'] ? request.query['size'] : 15;
    pool.connect(function(error, client, releaseFn) {
        if(error) {// if error then release the connection
            releaseFn();
            return console.log('Connection failed: ' + error);
        }
        var countSql = 'SELECT COUNT(*) AS total FROM userInfo';
        client.query(countSql, (error, results) => {
            if(error) {
                releaseFn();
                return console.log('Query failed: ' + error);
            }
            // total number of users
            var total = results.rows[0].total;
            var offset= (page - 1) * size;
            // query the target page of users
            var listSql = 'SELECT * FROM userInfo LIMIT ' + size + ' OFFSET ' + offset;
            client.query(listSql, (error, results) => {
                releaseFn();
                if(error) {
                    return console.log('Query userInfo failed: ' + error);
                }
                var data = results.rows;
                // OK, now we render the users
                response.render('pages/user-list', {
                    users: data,
                    total: total
                });
            });
        });
    });
});
// app.use('/uploads', express.static('uploads'));

app.get('/outfit', (req, res) => {
  res.render('pages/outfit-collages');
 });

