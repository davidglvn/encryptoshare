const express = require('express');
const helmet = require("helmet");
const path = require('path');
const nanoid = require('nanoid');
const config = require('./config');
const storeService = require('./storeService');

const app = module.exports = express();
app.use(helmet());
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const localStoreService = new storeService()
localStoreService.init()

function error(status, msg) {
    var err = new Error(msg);
    err.status = status;
    return err;
}

app.get('/', function(req, res) {
    res.render('encrypt', {page: config.pages.title, logoText: config.site.name});
});
app.get('/o/*', function(req, res) {
    res.render('decrypt', {page: config.pages.title, logoText: config.site.name});
});
app.use('/js/seedrandom.min.js', express.static(__dirname + '/node_modules/seedrandom/seedrandom.min.js'));
app.use('/js/clipboard.min.js', express.static(__dirname + '/node_modules/clipboard/dist/clipboard.min.js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(express.static('public'))

app.post('/api/item', function (req, res, next) {
    for (let step = 0; step < 5; step++) {
        var itemId = nanoid.nanoid(11);
        if (!localStoreService.checkIfExists(itemId)) {
            return res.send({"itemId":itemId});
        }
    }
    return next(error(500, "Failed to get new Item Id"))
})
app.put('/api/item/:itemId', function (req, res, next) {
    if ((typeof req.body.encrypted == 'undefined' || !req.body.encrypted) || (typeof req.body.privateKey == 'undefined' || !req.body.privateKey)) {
        return next(error(400, "Missing data to store"));
    }
    let itemId = req.params.itemId;
    localStoreService.storeEncryptedObject(itemId, req.body.encrypted);
    localStoreService.storePrivateKey(itemId, JSON.stringify(req.body.privateKey));
    return res.send({"itemId":itemId});
})
app.get('/api/item/:itemId', function (req, res, next) {
    let itemId = req.params.itemId;
    let cipherText = localStoreService.readEncryptedObject(itemId);
    let privateKey = JSON.parse(localStoreService.readPrivateKey(itemId));
    if ((!cipherText) || (!privateKey)) {
        return next(error(400, "Requested encrypted object wasn't found on the server"));
    }

    res.send({"itemId": itemId, "privateKey": privateKey, "encrypted": cipherText});

    localStoreService.deleteEncryptedObject(itemId);
    localStoreService.deletePrivateKey(itemId);
})

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        error: err.message
    });
});

app.use(function (req, res) {
    res.status(404);
    res.render('error', {page:'EncryptoShare', logoText: config.site.name, errorName: "Not Found", errorText: "You've reached missing location"});
    // res.send({
    //     error: "Nothing here"
    // });
});

if (!module.parent) {
    app.listen(config.web.port);
    console.log('Express started on port ' + config.web.port);
}