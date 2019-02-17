const keys = require('./keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const {plan1,plan2}=require('./plans');
module.exports={
    changePlan:function(session,plan)
    {
   stripe.subscriptions.retrieve(session.plan).then(sub=>{
    stripe.subscriptions.update(session.plan, {
        cancel_at_period_end: false,
        items: [{
          id: sub.items.data[0].id,
          plan,
        }]
      }).then(sub=>{
          session.plan=sub.id;
          console.log(plan+"-"+plan1);
          flag=false;
          if(plan === plan1)
           { 
               flag=true;
               session.tokens='10';
           }
          else
          { 
            flag=true;
            session.tokens='20';
        }
        while(1){
            if(flag==true)
            {
                console.log(session.tokens);
                session.save();
                break;
            }
        }
      })
   })
}}