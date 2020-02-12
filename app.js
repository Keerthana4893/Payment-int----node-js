const express =  require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
const bodyParser = require('body-Parser');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AdzrBV2zdHzKLZ_NqKD7hXyB5J-KKPnyJi5VGSY0EBFh9F7n9quqws34xm9HhYD3c8-an-O4VWy60WaM',
    'client_secret': 'EORxx0b6wSBb1f7e8JXwqhx0nCmjpZYHeHxIk-iimzkdlMLCakEGyUipK85rrrHFUxsXLVKPG3dMPS7Z'
  });
  
const app = express();
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index', {foo: 'FOO'});
});
//app.use(bodyParser.urlencoded({ extended : false }));
app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:4023/success",
            "cancel_url": "http://localhost:4023/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Transfer Amount",
                    "sku": "001",
                    "price": "100.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "100.00"
            },
            "description": "Money Transfer"
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                  res.redirect(payment.links[i].href);
        }
    }
}
    });
});

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "100.00"
          }
      }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));
  
app.listen(4023, () => console.log('Server Started'));