const express = require('express');
const keys = require('./config/keys');
const router = express.Router();
const stripe = require('stripe')(keys.stripeSecretKey);
const { plan1, plan2 } = require('./config/plans');
const passport = require('passport');
const User = require('./model/user');
const { sendMail } = require('./config/nodemailer');
const {calculateCost}=require('./config/proration');
const {changePlan}=require('./config/changePlan');

let session;

router.get('/direct',(req,res)=>{
  console.log(req.user);
  if(req.user.plan === undefined)
  res.redirect('/dashboard');
  else
  res.redirect('/main');
});

router.get('/dashboard', (req, res) => {
  console.log(req.session);
  session = req.user;
  console.log(session);
  res.render('dashboard', {
    stripePublishableKey: keys.stripePublishableKey
  });
});

router.get('/main', (req, res) => {
   res.render('main',{
    tokens:req.user.tokens
   }) 
  });

router.get('/', (req, res) => {
  res.render('login')
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/direct',
    failureRedirect: '/'
  })(req, res, next);
});
router.post('/receiveNotif', (req, res) => {

  const event = (req.body);
  const cust = event.data.object;
  console.log(event);
  console.log('hij');
  if (event.type === 'customer.subscription.deleted') {
    let msg = 'Hi there, As per your request your subscription has been canceled.';
    
    msg += ' Thank You'
    sendMail(session.email, msg);
  }
  if (event.type === 'invoice.payment_succeeded') {
    let msg = 'Hi there,Your payment For Web Development plan of ' + cust.amount_paid/100.0 + '$ has been done.';
    msg += 'Here are the details of same :' + cust.hosted_invoice_url;
    msg += ' Thank You'
    sendMail(session.email, msg);
  }
  else if (event.type === 'invoice.payment_failed') {
    let msg = 'Hi there,Your payment For Web Development plan of ' + cust.amount_paid/100.0 + '$ has failed due to some reasons.';
    msg += 'Here are the details of same :' + cust.hosted_invoice_url;
    msg += ' Thank You'
    sendMail(session.email, msg);
  }
  res.sendStatus(200);
});

router.post('/degradeSub', (req, res) => {
  const cost=calculateCost(req.user,plan1,function(cost){
    console.log(req.user);
    changePlan(req.user,plan1);
    const obj={
      value:cost
    }
    console.log(obj);
    res.json(obj);
  });
  
});
router.post('/upgradeSub', (req, res) => {
 const cost=calculateCost(req.user,plan2,function(cost){
  console.log(req.user);
  changePlan(req.user,plan2);
  const obj={
    value:cost
  }
  console.log(obj);
  res.json(obj);
});
});
router.get('/cancelSub', (req, res) => {
  stripe.subscriptions.del(req.user.plan);
  req.user.plan=undefined;
  req.user.customerId=undefined;
  req.user.tokens=undefined
  req.user.expDate=undefined
  req.user.save();
  res.redirect('/')
});
router.post('/subscribe', (req, res) => {

  let cust;
  let tokens;
  plan = req.query.plan;
  if (plan === '1') {
    plan = plan1;
    tokens = '10';
  }
  else {
    plan = plan2;
    tokens = '20';
  }
  stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken,
  }).then(customer => {
    cust = customer.id;
    stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: plan }]
    }).then(sub => {
      User.findById({ _id: session.id }).then(lab => {
        lab.customerId = cust,
          lab.plan = sub.id,
          lab.tokens = tokens,
          lab.expDate = sub.created
        lab.save().then(labs => {
          session=lab;
          console.log(lab);
        })
      });
      res.redirect('/main');
    })
  }).catch(err => console.log(err));

});

module.exports = router;