// const webCrypto = window.crypto;

function numberToArrayBuffer(value) {
    const view = new DataView(new ArrayBuffer(16))
    for (var index = 15; index >= 0; --index) {
        view.setUint8(index, value % 256)
        value = value >> 8;
    }
    return view.buffer
}

function stringToArrayBuffer(string) {
    return new TextEncoder().encode(string)
}

(function(exports){

    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return binary;
    };

    function base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // async function generatePrivateKey(encryptionAlgorithm="AES-GCM", encryptionAlgorithmLength=256) {
    //     return await webCrypto.subtle.generateKey({
    //             name: encryptionAlgorithm,
    //             length: encryptionAlgorithmLength,
    //         },
    //         true,
    //         ["encrypt", "decrypt"]
    //     );
    // };

    // async function cipherText(publicKey, privateKey, text, encryptionAlgorithm="AES-GCM", encryptionTagLength=128){
    //     let iv = new Math.seedrandom(publicKey);
    //     let enc = new TextEncoder();

    //     return await webCrypto.subtle.encrypt({
    //             name: encryptionAlgorithm,
    //             iv: numberToArrayBuffer(iv()),
    //             additionalData: stringToArrayBuffer(publicKey),
    //             tagLength: encryptionTagLength,
    //         },
    //         privateKey,
    //         enc.encode(text)
    //     )
    // };

    exports.arrayBufferToBase64 = arrayBufferToBase64;
    exports.base64ToArrayBuffer = base64ToArrayBuffer;
    // exports.generatePrivateKey = generatePrivateKey;
    // exports.cipherText = cipherText;

}(typeof exports === 'undefined' ? this['utilities'] = {} : exports));
