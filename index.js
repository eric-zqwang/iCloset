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
  // connectionString: process.env.DATABASE_URL,
  // ssl:{
  //   rejectUnauthorized: false
  // }

  // for local host
  connectionString: 'postgres://postgres:123wzqshuai@localhost/users' 
})

app.post('/signUp', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;
  var inputName = req.body.name;

  var result = pool.query(`SELECT * FROM usrs WHERE umail = '${inputEmail}';`)
  if (!result){
    res.send("The register email already exist")
  }
  else{
    try {
      await pool.query(`INSERT INTO usrs (uname, umail, upswd) 
      VALUES ('${inputName}', '${inputEmail}', '${inputPswd}')`);
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
    console.log("DUPLICATE USERS!!!");
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

app.get('/:id/uploadimg', async (req, res) => {
  let id  =req.params.id.substring(1);
  result = await pool.query(`SELECT * FROM usrs WHERE uid = '${id}'`);
     data = { results: result.rows };
  res.render('pages/uploadimg',data);

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

app.post('/:id/uploadImage', upload.single('upImg'), async (req, res) => {
  function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString('base64');
  }
  let id  =req.params.id.substring(1);
  var base64ImgData = base64Encode(req.file.path);
  var owner = await pool.query(`select * from userobj1`);
  await pool.query(`insert into userobj1 (txtimg, uid) values ('${base64ImgData}','${id}')`);
  const result = await pool.query(`select * from userobj1 where uid = '${id}'`);
  const data = { results: result.rows };
  res.render('pages/outfit-collages', data);
});

//url removebg
const {removeBackgroundFromImageUrl,removeBackgroundFromImageFile} = require("remove.bg");
const res = require('express/lib/response');

//able to change
const url = "https://img0.baidu.com/it/u=2287973901,668883338&fm=253&fmt=auto&app=138&f=JPEG?w=300&h=300";
const outputFile = "remove.png";
 
removeBackgroundFromImageUrl({
  url,
  apiKey: "oZ4aG5Km9m7fCuVQxYYZsGSn",
  size: "auto",
  type: "default",
  outputFile 
}).then((result) => {
 console.log(`File saved to ${outputFile}`);
  const base64img = result.base64img;
}).catch((errors) => {
 console.log(JSON.stringify(errors));
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

app.get('/:id/outfit', async (req, res) => {
  var id = req.params.id.substring(1);
  var result = await pool.query(`select * from userobj1 where uid ='${id}'`);
  var data = { results: result.rows };
   if(data.results.length==0){
     result = await pool.query(`SELECT * FROM usrs WHERE uid = '${id}'`);
     data = { results: result.rows };
   }
  
  
  res.render('pages/outfit-collages', data);

});

// Get users' information from database
app.get('/', (req, res) => res.render('pages/index'));
app.get('/userinfo', async (req,res) => {
  //invoke a query that selects all row from the users table
  try {
    const result = await pool.query('SELECT * FROM usrs');
    const data = { results : result.rows };
    res.render('pages/adminpage', data);
  }
  catch (error) {
    res.end(error);
  }
})

//Diplay details of the selected user
app.get('/usrs/:umail', async(req,res) => {
  var email = req.params.umail;
  //search the database using id
  const result = await pool.query(`SELECT * FROM usrs WHERE umail = '${email}';`);
  const data = { results : result.rows };
  res.render('pages/userdetail', data);
})

// Delete rectangles by ID
app.post('/usrs/:umail', async(req,res) => {
  var email = req.params.umail; 
  //search the database using id
  await pool.query(`DELETE FROM usrs WHERE umail= '${email}';`);
  //display current database
  const result = await pool.query("SELECT * FROM usrs");
  const data = { results : result.rows };
  res.render('pages/adminpage', data);
})


// Edit details of existing users
app.post('/edituser/:umail', async(req,res) => {
  var email = req.params.umail;
  //define variables that allow for changing
  var name = req.body.name;
  //var gender = req.body.gender;
  var password = req.body.password;
  var isadmin = req.body.isadmin;
  //search the database using umail
  await pool.query(`UPDATE usrs SET uname = '${name}', upswd = '${password}', admin = ${isadmin} WHERE umail = '${email}';`)
  //display current database
  const result = await pool.query(`SELECT * FROM usrs;`);
  const data = { results: result.rows };
  res.render('pages/adminpage', data);
})


// click like
app.post('/:uid/:imgID/postImg', async(req,res) => {
  try{
    var inputimgid = req.params.imgID.substring(1);
    var inputuserid = req.params.uid.substring(1);
    await pool.query(`insert into userInteraction (uid, likeNum, imgID)
    values (${inputuserid}, 0 , ${inputimgid})`);

    await pool.query(`update userobj1 set public = true where imgID = ${inputimgid}`)

    const imgfile =  await pool.query(`select txtimg from userobj1 where public = true`)

    const result = await pool.query(`select * from userInteraction`);
    const data = {imgfile:imgfile.rows, results:result.rows};
    res.render('pages/interactionPage', data);
  }
  catch(error){
    res.end(error);
  }
})

