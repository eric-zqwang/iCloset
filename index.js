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
      res.end(error);
    }
  }
})
