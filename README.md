# EncryptoShare

This is simple server that allow sharing encrypted text.  
Currently it's storing the encrypted content and private key as files on the server.

## Encryption/Decryption method

Encryption and decrption process are done on the client browser and the server is used to store and serve the encrypted data.  
Encryption is done by using browser built-in [Crypto Web API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto).

On each encryption new "private" and "public" keys generated and the text is encrypted with private key and public as additional tag. EncryptoShare server store the encrypted text and the private key on the server and server them by request. Public key and object ID (generated with [Nano ID](https://www.npmjs.com/package/nanoid)) are sent to the user in the browser and create unique link to access the encrypted object and decrypt it. Public key in decryption URL is stored as [URI fragment identifier](https://en.wikipedia.org/wiki/URI_fragment) and not sent to the server.  
Example URL:
```
[Protocol]://[ServerAddress]/o/[NanoID]#[PublicKey]

http://localhost:3000/o/StEmbyojfLy#ZL0LuOxNC9iJhzOyFc7pHuW0ugw64UB9UHepBf864TY=
```

Decryption is also happens on the browser. On the above URL accessed browser sent request to the server with the object ID (NanoID) and retrieve the private key and the encrypted object. After sending the result to the browser, the server delete the private key and the encrypted object.

### Concepts

- **Public Key** - Random 32-bit generated number with [Crypto Web API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) and encoded as base64
- **Private Key** - 256-bit `AES-GCM` [Crypto Web API generated key](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey)
- **Encrypted object** - [Crypto Web API encrypted object](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#AES-GCM) with Private Key and Public Key as additional data
- **Encryption Algorithm** - Default algorithm is `AES-GCM`, default size of authentication tag is 128
- **IV** - IV is random number with seed of object ID (NanoID). For generating seeded random number [seedrandom](https://github.com/davidbau/seedrandom), by David Bau, library is used

## How to use

### Configurations

Server can be configured via environment variables:
Variable | Default Value | Description
--- | --- | ---
SITE_NAME  | EncryptoShare  | Site name, used in the page title
WEB_PORT  | 3000  | Default server port
PAGE_TITLE  | EncryptoShare  | Used in the nav logo

### Customization

The site is using [Boostrap 4](https://getbootstrap.com/) and the theme is generated with [Themestr.app](https://themestr.app/).  
The HTML pages are generated using [EJS](https://ejs.co/)

### Running

Install required NPM modules and run the server
```
npm start
```

## Road map

- Add DynamoDB store
- Add TTL to the encrypted objects
- Implement serverless deployment
- Add API to create encrypted objects
