const keys = require('../file/keys');
const stripe = require('stripe')(keys.stripeSecretKey);

module.exports={
  calculateCost:function(session,plan,cb){
  const proration_date = Math.floor(Date.now() / 1000);
  console.log(session);
  stripe.subscriptions.retrieve(session.plan)
    .then(sub => {
      items = [{
        id: sub.items.data[0].id,
        plan,
      }];
      stripe.invoices.retrieveUpcoming(session.customerId, session.plan, {
        subscription_items: items,
        subscription_proration_date: proration_date,
      }).then(invoice => {
        const current_prorations = [];
        var cost = 0;
        var i;
        for (i = 0; i < invoice.lines.data.length; i++) {
          const invoice_item = invoice.lines.data[i];
          if (invoice_item.period.start == proration_date) {
            current_prorations.push(invoice_item);
            cost += invoice_item.amount;
            console.log(cost);
          }
        }
        while(1)
        {
          if(i == invoice.lines.data.length)
          {
            console.log(cost);
            cb(cost);
            return cost;
            break;
          }
        }
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}
}