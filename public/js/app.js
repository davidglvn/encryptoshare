

(() => {
    function numberToArrayBuffer(value) {
        const view = new DataView(new ArrayBuffer(32))
        for (var index = 15; index >= 0; --index) {
            view.setUint8(index, value % 256)
            value = value >> 8;
        }
        return view.buffer
    }

    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return binary;
    }
    function base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
    function stringToArrayBuffer(string) {
        return new TextEncoder().encode(string)
    }

    function generatePublicKey() {
        return window.btoa(arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(32))));
    }

    const Http = new XMLHttpRequest();
    let publicKey = generatePublicKey();
    let encryptObjId = "";
    let iv;
    const pathArray = window.location.pathname.split('/');
    const encryptionAlgorithm="AES-GCM"
    if (pathArray[1] === "o") {
        encryptObjId = pathArray[2];
        publicKey = window.location.hash.substr(1);
        iv = new Math.seedrandom(encryptObjId);
        iv = numberToArrayBuffer(iv());

        Http.open("GET", '/api/item/'+encryptObjId, true);
        Http.setRequestHeader("Content-Type", "application/json");
        Http.send();
        Http.onload = async (e) => {
            var resObj = JSON.parse(Http.responseText);
            if (Http.status === 200) {
                var privateKey = await window.crypto.subtle.importKey(
                    format="jwk",
                    keyData=resObj.privateKey,
                    algorithm=encryptionAlgorithm,
                    extractable=resObj.privateKey.ext,
                    keyUsages=resObj.privateKey.key_ops);

                decryptMessage(publicKey, privateKey, iv, resObj.encrypted).then((text) => {
                    const decryptedValue = document.querySelector("#decrypted-text");
                    decryptedValue.textContent = text;
                });
            } else if (Http.status === 400) {
                const decryptedBox = document.querySelector("#decrypted-box");
                decryptedBox.classList.toggle("bg-danger");
                const decryptedValue = document.querySelector("#decrypted-text");
                decryptedValue.textContent = resObj.error;
            }
        }
    } else {
        Http.open("POST", '/api/item/', true);
        Http.setRequestHeader("Content-Type", "application/json");
        Http.send();
        Http.onload = async (e) => {
            var resObj = JSON.parse(Http.responseText);
            if (Http.status === 200) {
                encryptObjId = await resObj.itemId;
                iv = new Math.seedrandom(encryptObjId);
                iv = numberToArrayBuffer(iv());

                generatePrivateKey().then((privateKey) => {
                    const encryptButton = document.querySelector("#encrypt-text");
                    encryptButton.addEventListener("click", () => {
                        encryptMessage(publicKey, privateKey, iv).then(async (encryptedText) => {
                            var privateKeyJWK = await window.crypto.subtle.exportKey("jwk", privateKey);

                            const itemUrlValue = document.querySelector("#text-to-encrypt");
                            const submitButtonBox = document.querySelector("#submit-button");
                            const shareButtonBox = document.querySelector("#share-button");
                            var clipboard = new ClipboardJS('#copy-button');

                            Http.open("PUT", '/api/item/' + encryptObjId);
                            Http.setRequestHeader("Content-Type", "application/json");
                            var data = JSON.stringify({"privateKey": privateKeyJWK, "encrypted": encryptedText});
                            Http.send(data);
                            Http.onload = (e) => {
                                var resObj = JSON.parse(Http.responseText);
                                const siteDomain = window.location.origin;
                                itemUrlValue.value = `${siteDomain}/o/${resObj.itemId}#${publicKey}`;
                                submitButtonBox.classList.toggle("d-none");
                                shareButtonBox.classList.toggle("d-flex");
                                submitButtonBox.classList.toggle("d-flex");
                                shareButtonBox.classList.toggle("d-none");
                            }
                        });
                    });
                });
            }
        }
    }
    let cipherText;

    function getMessageEncoding() {
        const messageBox = document.querySelector("#text-to-encrypt");
        let message = messageBox.value;
        let enc = new TextEncoder();
        return enc.encode(message);
    }

    async function encryptMessage(publicKey, privateKey, iv, encryptionAlgorithm="AES-GCM", encryptionTagLength=128) {
        let encoded = getMessageEncoding();
        cipherText = await window.crypto.subtle.encrypt(
            {
                name: encryptionAlgorithm,
                iv: iv,
                additionalData: stringToArrayBuffer(publicKey),
                tagLength: encryptionTagLength,
            },
            privateKey,
            encoded
        );

        let encrypted = window.btoa(arrayBufferToBase64(cipherText));
        return encrypted;
    }

    async function decryptMessage(publicKey, privateKey, iv, encryptedText, encryptionAlgorithm="AES-GCM", encryptionTagLength=128) {
        let decrypted = await window.crypto.subtle.decrypt(
            {
                name: encryptionAlgorithm,
                iv: iv,
                additionalData: stringToArrayBuffer(publicKey),
                tagLength: encryptionTagLength,
            },
            privateKey,
            base64ToArrayBuffer(encryptedText)
        );

        let dec = new TextDecoder();
        return dec.decode(decrypted);
    }

    async function generatePrivateKey(encryptionAlgorithm="AES-GCM", encryptionAlgorithmLength=256) {
        var key = await window.crypto.subtle.generateKey(
            {
                name: encryptionAlgorithm,
                length: encryptionAlgorithmLength,
            },
            true,
            ["encrypt", "decrypt"]
        );
        return key;
    }

})();