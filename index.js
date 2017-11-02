var request = require('request');
var moment = require('moment');
var ee = require('events').EventEmitter;
var util = require('util');

function Simplii (cardNumber, password) {
   var self = this;
   if (cardNumber === undefined) throw new Error('CardNumber missing');
   if (password === undefined) throw new Error('Password missing');

   self.token = ''

   self.authUrl = 'https://online.simplii.com/ebm-anp/api/v1/json/sessions';
   self.accountUrl = 'https://online.simplii.com/ebm-ai/api/v1/json/accounts';
   self.txUrl = 'https://online.simplii.com/ebm-ai/api/v1/json/transactions';

   self._authenticate(cardNumber, password)
}

util.inherits(Simplii, ee);

Simplii.prototype._authenticate = function(cardNumber, password) {
   var self = this;

   var headers = {
      'WWW-Authenticate' : 'CardAndPassword',
      'X-Auth-Token' : '',
      'Content-Type' : 'application/vnd.api+json'
   };

   var data = {
      card: {
         value: cardNumber,
         description: '',
         encrypted: false,
         encrypt: false
      },
      password: password
   };

   request({
      method : 'POST',
      url : self.authUrl,
      headers : headers,
      json : data
   }, function (err, response, body) {
	   if (err) {
         return self.emit('error',{message: 'authentication_failed', details: body});
      }
      self.token = response.headers['x-auth-token'];
      self.emit('ready');
   });
}

Simplii.prototype.getAccounts = function(cb) {
	var self = this;

	request({
	   method: 'GET',
		url : self.accountUrl,
		headers : {
		    'X-Auth-Token' : self.token
		},
		json: true
	}, function(err, response, body) {
		if (err) {
         return cb({ message: 'failed to get accounts', details: body });
      }
      cb(null, body);
   });
}

Simplii.prototype.getTransactions = function(accountId, cb) {
   var self = this;

   var start = moment().subtract(1, 'month').format('YYYY-MM-DD');
   var end = moment().add(5,'days').format('YYYY-MM-DD');

   request({
      method: 'GET',
      url : self.txUrl,
      headers : {
         'X-Auth-Token' : self.token
      },
      qs : {
         'accountId' : accountId,
         'filterBy':'range', 
         'fromDate': start, 
         'lastFilterBy': 'range', 
         'limit': 1000, 
         'lowerLimitAmount': '',
         'offset': 0, 
         'sortAsc':true, 
         'sortByField':'date', 
         'toDate': end, 
         'transactionType':'', 
         'upperLimitAmount':''
      },
      json: true
   }, function(err, response, body) {
      if (err || response.statusCode != 200) {
         return cb({ message: 'failed to get transactions for account ' + accountId, details: body });
      }
      cb(null, body);
   });
}

Simplii.prototype.logout = function() {
	var self = this;

	request({
		method: 'DELETE',
		url: 'https://online.simplii.com/ebm-anp/api/v1/json/sessions',
		headers: {
			'X-Auth-Token' : self.token
		}	
	}, function(err, response, body) {
		self.token = '';
	});
}

module.exports = Simplii;
