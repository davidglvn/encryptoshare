const fs = require('fs');

class FileStoreService {
    constructor() {
        this.encryptedObjectsDir = 'encryptedObjects';
        this.privateKeysDir = 'privateKeys';
    }

    init() {
        if (!fs.existsSync(this.encryptedObjectsDir)){
            fs.mkdirSync(this.encryptedObjectsDir);
        }
        if (!fs.existsSync(this.privateKeysDir)){
            fs.mkdirSync(this.privateKeysDir);
        }
    }

    storeEncryptedObject(itemId, obj) {
        fs.writeFileSync(this.encryptedObjectsDir + '/' + itemId, obj);
    }

    storePrivateKey(itemId, key) {
        fs.writeFileSync(this.privateKeysDir + '/' + itemId + '.jwk', key);
    }

    deleteEncryptedObject(itemId) {
        fs.unlinkSync(this.encryptedObjectsDir + '/' + itemId)
    }

    deletePrivateKey(itemId) {
        fs.unlinkSync(this.privateKeysDir + '/' + itemId + '.jwk')
    }

    readEncryptedObject(itemId) {
        try {
            return fs.readFileSync(this.encryptedObjectsDir + '/' + itemId, "utf8");
        } catch(err) {
            console.log("Encrypted object not found");
            return false
        }
    }

    readPrivateKey(itemId) {
        try {
            return fs.readFileSync(this.privateKeysDir + '/' + itemId + '.jwk');
        } catch(err) {
            console.log("Private Key not found");
            return false
        }
    }

    checkIfExists(itemId) {
        if (fs.existsSync(this.encryptedObjectsDir + '/' + itemId) && fs.existsSync(this.privateKeysDir + '/' + itemId)) {
            return true
        }
        return false
    }
}

module.exports = FileStoreService;