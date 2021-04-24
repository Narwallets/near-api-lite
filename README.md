# near-api-lite
non-official Narwallets' near-api js/ts lite version

near-api-lite is a a subset of the official [near-api-js](https://www.npmjs.com/package/near-api-js)

### Differences:

* Smaller, just core functionality

### What's included

* Transaction
* Borsh Serializer
* a .ts cut-down version fo TweetNacl (only sign/25519 curve)
* bn.js
* json-rpc (minimal)
* near-rpc (minimal)

### What's not included

* KeyStores
* Providers
* Signers
* Connection, Account, NEAR-Wallet & Contracts Wrappers
* NEAR-Wallet navigate-to integration
* Validators abstractions
* Multisig abstractions

## Objective

This is a simpler API intended to analyze the minimal required API to interact with the NEAR blockchain

## Prerequisites:

- Current version of [Node.js](https://nodejs.org/). >=v14.0.0

## Setup:

1) Install dependencies by running:
```bash
npm i
```

Happy coding! 🚀 
