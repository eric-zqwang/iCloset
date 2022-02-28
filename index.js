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

  
app.get('/', (req, res) => res.render('pages/index'));

app.post('/signUp', async (req, res) => {
  var inputEmail = req.body.email;
  var inputPswd = req.body.pswd;
  var inputRepeatPswd = req.body.repeatPswd;
  try {
    await pool.query(`INSERT INTO usrs (umail, upswd)
    VALUES ('${inputEmail}', '${inputPswd}')`);
    res.render('pages/index');
  }
  catch (error) {
    res.end(error);
  }
})

