const express = require('express');
const path = require('path')
var cors = require('cors') // cross-origin resource sharing
const session = require("express-session")
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000

var app = express()
app.use(express.json());
app.use("/", cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// redirect user to login page if they dont have a session
app.use(function (req, res, next) {
  function validateAccess(sessionUID, reqPath) {
    const regex = /^\/\:(\d+)\/\s*/g;
    const results = regex.exec(reqPath);
    if ( !!results && results.length > 1) {
      const requestUID = results[1];
      return sessionUID == requestUID;
    }
    return true;
  }

  console.log("DEBUGG ROOT "+ req.path );

  if (req.path.endsWith("login") || req.path.endsWith("signUp")) {
    next();
  } else if(req.path.endsWith("pswd") || req.path.endsWith("resetPswd")){
    next();
  }
  else if (curSession == null) {
    // if user is not logged-in redirect back to login page
    res.redirect('/userlogin.html');
  } else if (validateAccess(curSession.user.uid, req.path)) {
    console.log("DEBUGG ROOT user id " + curSession.user.uid );

    next();
  } else {
    res.send("Access denied on viewing resources")
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
    //  ssl:{
    //   rejectUnauthorized: false
    // }

  // for local host
  //  connectionString: 'postgres://postgres:123wzqshuai@localhost/users' 
  // connectionString: 'postgres://nicoleli:12345@localhost/icloset'  
   connectionString: 'postgres://postgres:root@localhost/try1'
  //connectionString: 'postgres://postgres:woaini10@localhost/users'  
})

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
     user: 'iclosetcmpt@gmail.com', 
     pass: 'Icloset276' 
  }
});
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/signUp', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;
  var inputName = req.body.name;
  emailToken = crypto.randomBytes(64).toString('hex');

  var result = pool.query(`SELECT * FROM usrs WHERE umail = '${inputEmail}';`)
  if (!result) {
    res.send("The register email already exist")
    console.log("error")
  }
  else {
    var message = {
      from: 'iclosetcmpt@gmail.com',
      to: inputEmail,
      subject: 'iCloset - verify your email',
      html:`
        <h1>Hello,</h1>
        <p>thanks for registering on our site.</p>
        <p>Please click the link below to verify your account.</p>
        <a href="http://${req.headers.host}/verify-email?token=${emailToken}">verify your account</a>
      `
    }
    //sending email
    
    try{
      transporter.sendMail(message, async(error, info)=>{
        if(error){
          console.log(error)
        }
        else{
          // console.log('verification email is sent to your gmail account')
          await pool.query(`INSERT INTO usrs (uname, umail, upswd) VALUES ('${inputName}', '${inputEmail}', '${inputPswd}')`)
          res.send("Please confirm your email.");
        }
      })
    }catch(error){
      console.log(error);
    }    
  }    
})

//Email verification route
app.get('/verify-email', async(req,res)=>{
  try {
    emailToken = null;
    res.redirect('/userlogin.html');
  }catch(error){
    console.log(error);
    res.redirect('/signUp.html');
  }
})

var curSession;
// regular user login, direct to homepage
app.post('/userlogin', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;

  // search database using umail
  const result = await pool.query(`SELECT * FROM usrs WHERE umail = '${inputEmail}';`);
  const currentid = await pool.query(`SELECT uid FROM usrs WHERE umail = '${inputEmail}';`);
  const data = { currentuids:currentid.rows, results: result.rows };

  //If umail is not unique
  if (data.results.length > 1) {
    console.log("DUPLICATE USERS!!!");
  }

  //If umail and password are correct, direct to homepage
  else if (data.results.length == 1 && inputPswd == data.results[0].upswd) {
    var user = { 
      name: data.results[0].uname, 
      password: data.results[0].upswd,
      uid: data.results[0].uid
    };
    req.session.user = user;
    curSession = req.session;

    res.render('pages/homepage', data);
  }

  //If umail does not exist or password is incorrect, alert user
  else if (data.results.length == 0 || inputPswd != data.results[0].upswd) {
    res.send("Incorrect email or password");
  }
})

// admin login, direct to user-list
app.post('/adminlogin', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;

  // search database using umail
  let result = await pool.query(`SELECT * FROM usrs WHERE umail = '${inputEmail}';`);

  //If umail is not unique
  if (result.rows.length > 1) {
    console.log("DUPLICATE USERS!!!");
  }
  //If umail and password are correct and is admin, direct to user-list
  else if (result.rows.length == 1 && inputPswd == result.rows[0].upswd && result.rows[0].admin == true) {
    const uid = result.rows[0].uid;
    var user = { 
      name: result.rows[0].uname, 
      password: result.rows[0].upswd,
      uid: uid
     };
    req.session.user = user;
    curSession = req.session;
    result = await pool.query(`SELECT * FROM usrs;`);
    let data = { uid: uid, results: result.rows };
    res.render('pages/adminpage', data)
  }
  //If umail does not exist or password is incorrect, alert user
  else if (data.results.length == 0 || inputPswd != data.results[0].upswd) {
    console.log("incorrect login email or password");
  }
})

app.post('/resetPswd', async(req,res)=>{
  var emailNew = req.body.email;
  var pswdNew = req.body.pswd;

  var result = pool.query(`SELECT * FROM usrs WHERE umail = '${emailNew}';`)
  // if (result[0].upswd == pswdNew) {
  //   res.send("You cannot set the same password!!!")
  // }
 if(!result){
    res.send("You are not the iCloset user!!!")
  }
  else {
    try {
      await pool.query(`UPDATE usrs SET upswd = '${pswdNew}' WHERE umail = '${emailNew}';`);
      res.redirect('/userlogin.html');
    }
    catch (error) {
      res.send("Please try again");
    }
  }
})

app.post('/pswd', async (req, res) => {
  var inputEmail = req.body.email;
  emailToken = crypto.randomBytes(64).toString('hex');
    var message = {
      from: 'iclosetcmpt@gmail.com',
      to: inputEmail,
      subject: 'iCloset - change your password',
      html:`
        <h1>Hello,</h1>
        <p>Please click the link below to reset your password.</p>
        <a href="http://${req.headers.host}/reset-pswd?token=${emailToken}">reset your password</a>
      `
    }
    //sending email
    try{
      transporter.sendMail(message, async(error, info)=>{
        if(error){
          console.log(error)
        }
        else{
          console.log('verification email is sent to your gmail account')
          res.send("Please check your email.");
        }
      })
    }catch(error){
      console.log(error);
    }    
   
})

//reset password page
app.get('/reset-pswd', async(req,res)=>{
  try {
    emailToken = null;
    res.redirect('/password.html');
  }catch(error){
    console.log(error);
    res.redirect('/signUp.html');
  }
})

app.get('/:id/userlogout', async (req, res) => {
  if (curSession) {
    curSession.destroy();
    curSession = null;
  }
  req.session.destroy();
  res.redirect('/userlogin.html');
})

app.get('/:id/uploadimg', async (req, res) => {
  let uid  =req.params.id.substring(1);
  const result = await pool.query(`SELECT * FROM usrs WHERE uid = '${uid}'`);
  const currentid = await pool.query(`select * from usrs where uid = '${uid}'`);
  const data = {currentuids:currentid.rows, results:result.rows};
  res.render('pages/uploadimg',data);
})

app.get('/:id/collage', async (req, res) => {
  var id = req.params.id.substring(1);
  var result = await pool.query(`select * from userobj1 where uid ='${id}'`);
  const currentid = await pool.query(`select * from usrs where uid = '${id}'`);
  const data = {currentuids:currentid.rows, results:result.rows};
  res.render('pages/collages', data);
});

app.get('/:id/outfits', async (req, res) => {
  var id = req.params.id.substring(1);
  var result = await pool.query(`select * from userobj1 where uid ='${id}'`);
  const currentid = await pool.query(`select * from usrs where uid = '${id}'`);
  const data = {currentuids:currentid.rows, results:result.rows};
  res.render('pages/outfits', data);
});

app.get('/:id/outfits/:imgid', async (req, res) => {
  var id = req.params.id.substring(1);
  var imgid = req.params.imgid.substring(1);
  var result = await pool.query(`select * from userobj1 where imgid ='${imgid}'`);
  const currentid = await pool.query(`select * from usrs where uid = '${id}'`);
  const data = {currentuids:currentid.rows, results:result.rows};
  res.render('pages/outfits-images', data);
});

app.post('/:id/outfits/:imgid', async (req, res) => {
   const id = req.params.id.substring(1);
   const imgid = req.params.imgid.substring(1);
   const type = req.body.category;
   const public = req.body.public;
   await pool.query(`update userobj1 set category_type = '${type}', public = '${public}' where imgid = '${imgid}'`);
  res.redirect(`/:${id}/outfits/:${imgid}`);
});

//delete clothes
app.post('/:id/outfits/:imgid/delete', async (req, res) => {
  const id = req.params.id.substring(1);
  const imgid = req.params.imgid.substring(1);
  await pool.query(`delete from userobj1 where imgid = '${imgid}'`);
  await pool.query(`delete from usercomment where imgid = '${imgid}'`);
  await pool.query(`delete from requests where recipientimgid = '${imgid}'`);
  await pool.query(`delete from requests where requestorimgid = '${imgid}'`);
  await pool.query(`delete from userlike where imgid = '${imgid}'`);
 res.redirect(`/:${id}/outfits`);
});

//upload image
const fs = require('fs')
const multer = require('multer');
const { redirect } = require('express/lib/response');
const { removeBackgroundFromImageFile } = require("remove.bg");
const { user } = require('pg/lib/defaults');
const { Router } = require('express');

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
//upload image post
app.post('/:id/uploadImagewithRemoveBG', upload.single('upImg'), async (req, res) => {
  function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString('base64');
  }
  var id = req.params.id.substring(1);
  var categoryType = req.body.category;
  var localFile = req.file.path;
  var outputFile = req.file.path;
  //remove background
  async function myRemoveBgFunction(path, outpath) {
    const outputFile = outpath;
    await removeBackgroundFromImageFile({
      path,
      apiKey: "oG1pnYKp9UKwEycz9gRkCGV4",
      size: "auto",
      type: "default",
      scale: "100%",
      outputFile
    }).catch(e => {console.log(e); throw e;});
    var base64ImgData = base64Encode(outputFile);
    //update database
    var name = await pool.query(`select uname from usrs where uid ='${id}'`);
    await pool.query(`insert into userobj1 (txtimg, uid,category_type,public,likenum,uname,date) values ('${base64ImgData}','${id}','${categoryType}',false,0,'${name.rows[0].uname}', 0)`);  
    res.redirect(`/:${id}/outfits`)
  };
  myRemoveBgFunction(localFile, outputFile);
});

app.post('/:id/uploadImage', upload.single('upImg'), async (req, res) => {
  function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString('base64');
  }
  var id = req.params.id.substring(1);
  var categoryType = req.body.category;
  var base64ImgData = base64Encode(req.file.path);
  //update database
  var name = await pool.query(`select uname from usrs where uid ='${id}'`);
  await pool.query(`insert into userobj1 (txtimg, uid,category_type,public,likenum,uname) values ('${base64ImgData}','${id}','${categoryType}',false,0,'${name.rows[0].uname}')`);
  res.redirect(`/:${id}/outfits`)
 });


// Get users' information from database
app.get('/', (req, res) => res.render('pages/index'));
app.get('/userinfo', async (req, res) => {
  //invoke a query that selects all row from the users table
  try {
    const result = await pool.query('SELECT * FROM usrs');
    const data = { uid: curSession.user.uid, results: result.rows };
    res.render('pages/adminpage', data);
  }
  catch (error) {
    res.end(error);
  }
})

//Diplay details of the selected user
app.get('/usrs/:umail', async (req, res) => {
  var email = req.params.umail;
  //search the database using id
  const result = await pool.query(`SELECT * FROM usrs WHERE umail = '${email}';`);
  const data = { uid: curSession.user.uid, results: result.rows };
  res.render('pages/userdetail', data);
})

// Delete user by ID
app.post('/usrs/:umail', async (req, res) => {
  var email = req.params.umail;
  //search the database using id
  await pool.query(`DELETE FROM usrs WHERE umail= '${email}';`);
  //display current database
  const result = await pool.query("SELECT * FROM usrs");
  const data = { uid: curSession.user.uid, results: result.rows };
  res.render('pages/adminpage', data);
})


// Edit details of existing users
app.post('/edituser/:umail', async (req, res) => {
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
  const data = { uid: curSession.user.uid, results: result.rows };
  res.render('pages/adminpage', data);
})

// jin ru like page
app.get('/:uid/market', async(req,res) => {
  try{
    let uid = req.params.uid.substring(1);
    const result = await pool.query(`select * from userobj1 where public = true order by imgid`)
    const currentid = await pool.query(`select uid from usrs where uid = '${uid}'`)
    const comments = await pool.query(`select * from usercomment order by imgid`);
    const data = {usercomments:comments.rows, currentuids:currentid.rows, results:result.rows}

    res.render('pages/interactionPage', data)
 
  }
  catch (error) {
    res.end(error);
  }


})


// click like

app.post('/:currentuid/:imgID/clickLike', async(req,res) => {
  try{
    let currentUID = req.params.currentuid.substring(1);
    const currentid = await pool.query(`select uid from usrs where uid = '${currentUID}'`)
    var inputimgid = req.params.imgID.substring(1);
    
    var ifexists = await pool.query(`select exists (select iflike from userlike where imgid = ${inputimgid} AND uid = ${currentUID})`)
    
    if(ifexists['rows'][0]['exists'] == false){
      await pool.query(`insert into userlike (imgid, uid, iflike) values (${inputimgid}, ${currentUID}, true )`);

      await pool.query(`update userobj1 set likenum = likenum + 1 where imgid = ${inputimgid}`);
    
      const result =  await pool.query(`select * from userobj1 where public = true order by imgid`)
  
      const comments = await pool.query(`select * from usercomment`);
    }
    res.redirect(`/:${currentUID}/market`);
    
  }
  catch (error) {
    res.end(error)
  }
})


app.post('/:currentuid/:imgID/comment', async(req,res) => {
  try{
    let uid = req.params.currentuid.substring(1);
    const currentuid = await pool.query(`select uid from usrs where uid = '${uid}'`)

    var uname = await pool.query(`select uname from usrs where uid=${uid}`)    

    var currentUID = req.params.currentuid.substring(1);
    var inputimgid = req.params.imgID.substring(1);
    var comment = req.body.comments;

    await pool.query(`insert into usercomment (uname, imgid, uid, imagecomment)
    VALUES ('${uname['rows'][0]['uname']}', ${inputimgid}, ${currentUID}, '${comment}')`)

    const result =  await pool.query(`select * from userobj1 where public = true`);
    const comments = await pool.query(`select * from usercomment order by imgid`);
    
    res.redirect(`/:${uid}/market`);
  }
  catch(error){
    res.end(error);
  }
})


//delete comment
app.post('/:currentuid/:imgID/:commentid/deleteComment', async(req,res) => {
  try{
    let uid = req.params.currentuid.substring(1);
    let commentID = req.params.commentid.substring(1);
    console.log(commentID);

    await pool.query(`delete from usercomment where commentid = ${commentID}`);

    const result = await pool.query(`select * from userobj1 where public = true order by imgid`)
    const currentuid = await pool.query(`select uid from usrs where uid = '${uid}'`)
    const comments = await pool.query(`select * from usercomment order by imgid`);
    res.redirect(`/:${uid}/market`);
  }
  catch(error){
    res.end(error);
  }
})

// jin ru calendar page
app.get('/:uid/calendar', async(req,res) => {
  try{
    let uid = req.params.uid.substring(1);
    const currentuid = await pool.query(`select uid from usrs where uid = ${uid}`);
    const result = await pool.query(`select * from userobj1`);
    const data = {currentuids:currentuid.rows, results:result.rows};
    res.render('pages/calendar', data);
  }
  catch(error){
    res.end(error);
  }
})

//get messages
app.get('/:id/Messages', async (req, res) => {
  const id = req.params.id.substring(1);
  //RR = requests recevied by the uesr; YR = The user's requests
  var RRrequestimg = await pool.query(
    `select uid,uname,imgid,txtimg,reqid,status from requests inner join userobj1 
    on userobj1.imgid = requests.requestorimgid and requests.recipientid = ${id} order by reqid`);

   var RRreceiverimg = await pool.query(
    `select uid,uname,imgid,txtimg,reqid,status from requests inner join userobj1 
    on userobj1.imgid = requests.recipientimgid and requests.recipientid = ${id} order by reqid`);
  
  var YRrequestimg = await pool.query(
    `select uid,uname,imgid,txtimg,reqid,status from requests inner join userobj1 
    on userobj1.imgid = requests.requestorimgid and requests.requestorid = ${id} order by reqid`);

   var YRreceiverimg = await pool.query(
    `select uid,uname,imgid,txtimg,reqid,status from requests inner join userobj1 
    on userobj1.imgid = requests.recipientimgid and requests.requestorid = ${id} order by reqid`);
    const currentid = await pool.query(`select * from usrs where uid = '${id}'`);
  const data = {currentuids:currentid.rows, RRreceiverimgs:RRreceiverimg.rows, RRrequestimgs:RRrequestimg.rows,
                 YRreceiverimgs:YRreceiverimg.rows, YRrequestimgs:YRrequestimg.rows};
  res.render('pages/MessagesCenter', data);
});

//get trading
app.get('/:id/:imgid/trade', async (req, res) => {
  const id = req.params.id.substring(1);
  const imgid = req.params.imgid.substring(1);
  const targetimg = await pool.query(`select * from userobj1 where imgid ='${imgid}'`);
  const currentuserimg = await pool.query(`select * from userobj1 where uid ='${id}'`);
  const currentid = await pool.query(`select * from usrs where uid = '${id}'`);
  const data = {currentuids:currentid.rows, targetimgs:targetimg.rows, currentuserimgs:currentuserimg.rows};
  res.render('pages/trading', data);
});

//post a trading request
app.post('/:id/trade/:imgid', async (req, res) => {
  //requestor
  const uid = req.params.id.substring(1);
  const choosenimgid=req.body.choosenid;
  //recipent
  const recipentimgid = req.params.imgid.substring(1); 
  const recipentid = await pool.query(`select uid from userobj1 where imgid = ${recipentimgid}`);
  await pool.query(`insert into requests (recipientid, recipientimgid,requestorid,requestorimgid, status) values ('${recipentid.rows[0].uid}','${recipentimgid}','${uid}','${choosenimgid}', 'Processing')`);
  res.redirect(`/:${uid}/Messages`);
});

//post cancel trading
app.post('/:id/cancel_trading_request/', async (req,res) =>{
  const uid = req.params.id.substring(1);
  const reqid = req.body.requestid;
  await pool.query(`delete from requests where reqid = '${reqid}'`);
  res.redirect(`/:${uid}/Messages`);
});

//post accept trading
app.post('/:id/accept_trading_request/', async (req,res) =>{
  const uid = req.params.id.substring(1);
  const reqid = req.body.requestid;
  const status = req.body.status;
  const statusChecker = await pool.query(`select status from requests where reqid = ${reqid}`);
  if( status != statusChecker.rows[0].status ){
    res.redirect(`/:${uid}/Messages`);
  }
 
  const yourclothid = req.body.yourimgid;
  const requesotrclothid = req.body.requestorimgid;
  const yourid = req.body.yourid;
  const requestorid = req.body.requestorid;
  const yourname = req.body.yourname;
  const requestorname = req.body.requestorname;
  
  // exchange the clothes
  await pool.query(`update userobj1 set uid=${yourid}, uname='${yourname}', public='false' where imgid = ${requesotrclothid}`);
  await pool.query(`update userobj1 set uid=${requestorid}, uname='${requestorname}', public='false' where imgid = ${yourclothid}`);  
  // reject other trading orders if accept
  await pool.query(`update requests set status='Rejected' where recipientimgid = ${yourclothid} and reqid != ${reqid}`);
  await pool.query(`update requests set status='Rejected' where recipientimgid = ${requesotrclothid} and reqid != ${reqid}`);
  // remove other trading requests post if accept
  await pool.query(`delete from requests where requestorimgid = '${yourclothid}' and reqid != ${reqid}`);
  await pool.query(`delete from requests where requestorimgid = '${requesotrclothid}' and reqid != ${reqid}`);
  // status-->Complected
  await pool.query(`update requests set status='Complected' where reqid = ${reqid}`);
  res.redirect(`/:${uid}/Messages`);
});

//post reject trading
app.post('/:id/reject_trading_request/', async (req,res) =>{
  const uid = req.params.id.substring(1);
  const reqid = req.body.requestid;
  const status = req.body.status;
  const statusChecker = await pool.query(`select status from requests where reqid = ${reqid}`);
  if( status != statusChecker.rows[0].status ){
    res.redirect(`/:${uid}/Messages`);
  }
  // reject trading orders
  await pool.query(`update requests set status='Rejected' where reqid = ${reqid}`);
  res.redirect(`/:${uid}/Messages`);
});


module.exports = app;