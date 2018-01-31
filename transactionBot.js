var _ = require('lodash');
var popsicle = require('popsicle');
var os = require('os');
var ark = require('arkjs');

// Globals
const protocol = "http";
const ip = "52.71.146.212";
const port = "4100";
const version = 43;
const __headers = {
	os: os.platform() + os.release(),
	version: version, // TODO: config
	port: port,
	nethash: "482a090e26c3ced0cb389c63d1e42d4d55993d20623c7ebee8e630b0eaa243fd", // Steak hash
	'Content-Type': 'application/json' // only needed when sending data.
};

const account1 = {
	address: "JMHXMzP7vxAVvwEzg1vQZEbu1jy1AmLQjy",
	publicKey: "035ae476a82a66f75fb8d6236507c9158609a06028fac51fbdcb462748ef5bdcb4",
	passphrase: "",
}
const account2 = {
	address: "Jffemxo47ehp3w85bkmvMqSYbALf2EqpPG",
	publicKey: "",
	passphrase: "",
}

var __private = {
	// hold the Peer list
	// By default one peer by IP is accepted.
	peers: {}
};

// Constructor
function TransactionBot () {
	var getPeers = this.getPeers;
	var swapSteak = this.swapSteak;
	setInterval(function(){
		// getPeers().then(peers => console.log(peers));
		swapSteak(account1, account2, 1000000000).then(res => console.log(res));
		swapSteak(account2, account1, 1000000000).then(res => console.log(res));
	}, 3000);
}

TransactionBot.prototype.swapSteak = function(sender, recipient, amount) {
	ark.crypto.setNetworkVersion(43);

	var tx = ark.transaction.createTransaction(
		recipient.address,
		amount,
		null,
		sender.passphrase,
		null
	);

	// Add extra props to the transaction.
	tx.senderId = sender.address;	
	tx.label = 'Swap Steak';
	tx.date = getDate(tx.timestamp);
	tx.total = -1 * (tx.amount + tx.fee) ;
	tx.humanTotal = tx.total / Math.pow(10, 8);
	tx.confirmations = 0;
	tx.hop = 1;

	body = {transactions: [tx]};

	return new Promise((resolve) => {
		post("/peer/transactions", body, (res) => {
			resolve(res);
		});
	});
}

TransactionBot.prototype.getAccount = function(address) {
	return new Promise((resolve) => {
		get("GET", `/api/accounts?address=${address}`, (res) => {
			// TODO: how to handle error?
			resolve(res);
		});
	})
}

// Get peers from seed peer.
TransactionBot.prototype.getPeers = function() {
	return new Promise((resolve) => {
		get("GET", "/api/peers", (res) => {
			if (res && res.body) {
				res.body.peers.forEach(peer => {
					__private.peers[peer.ip] = peer;
					resolve(__private.peers);
				});
			}
		});
	});
}

function get(path, cb) {
	// TODO: get a random peer for ip address.
	var req = {
		url: `${protocol}://${ip}:${port}${path}`,
		method: "GET",
		headers: __headers,
		timeout: 2000,
	};

	var request = popsicle.request(req);
	request.use(popsicle.plugins.parse(['json'], false)).then(function (res) {
		cb(res);
	});
}

function post(path, body, cb) {
	// TODO: get a random peer for ip address.
	var req = {
		url: `${protocol}://${ip}:${port}${path}`,
		method: "POST",
		body: body,
		headers: __headers,
		timeout: 2000,
	};

	var request = popsicle.request(req);
	request.use(popsicle.plugins.parse(['json'], false)).then(function (res) {
		cb(res);
	});
}

function getDate(timestamp) {
	return new Date((
		timestamp + parseInt(
			new Date(
				Date.UTC(2017, 2, 21, 13, 0, 0, 0)
			).getTime() / 1000
		)) * 1000
	);
}

// Export
module.exports = TransactionBot;
