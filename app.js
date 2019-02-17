const express = require('express');
const keys = require('./config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const bodyParser = require('body-parser');
const ejs=require('ejs');
const passport=require('passport');
const {localAuth}=require('./config/passport');
const mongoose=require('mongoose');
const session=require('express-session');
const app = express();

const routes=require('./routes.js');

var db=mongoose.connect('mongodb+srv://Rajat:Bhoolgaya0@cluster0-kr99w.mongodb.net/test?retryWrites=true',{ useNewUrlParser: true }).then(()=>console.log('MongoDb Connected'))
.catch(err => console.log(err));

localAuth(passport);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(`${__dirname}/public`));
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })

);

app.use(passport.initialize());
app.use(passport.session());

app.use('/',routes);


const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log('Server Started');
});