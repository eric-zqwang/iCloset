const express = require('express');
const { render } = require('express/lib/response');
const path = require('path')
const PORT = process.env.PORT || 5000

var app = express()

const { Pool } = require('pg');

var pool;
// pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl:{
//     rejectUnauthorized: false
//   } 
// })
pool = new Pool({
  // for the local host
  connectionString: 'postgres://postgres:123wzqshuai@localhost/users' 
})


app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'));

app.post('/signUp', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;

  try {
    await pool.query(`INSERT INTO usrs (umail, upswd)
    VALUES ('${inputEmail}', '${inputPswd}')`);
    res.render('pages/index');
  }
  catch (error) {
    res.end(error);
  }
})


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));