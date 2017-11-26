Simplii Financial API
=====================

## Getting Started

Install the simplii library:

```bash
npm install --save simplii
```

```js
var Simplii = require('simplii');

var simplii = new Simplii(<cardNumber>, <password>);

// Wait for authentication
simplii.on('ready', function () {
  
   // Fetch accounts
   var accounts = simplii.getAccounts(callback)

   // Fetch transactions for the last month for the given accountId
   var transactions = simplii.getTransactions(accountId, callback);

})
```

Currently, only the last 30 days of transactions are downloaded. It is possible to modify the transaction query string to download different periods.  Simplii Financial only allows transaction downloads for the 12 months.
