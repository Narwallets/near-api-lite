# near-api-lite
non-official Narwallets' near-api js/ts lite version - **for node.js**

near-api-lite is a subset of the official [near-api-js](https://www.npmjs.com/package/near-api-js)

It has no dependencies and unpacked size is ~240kb (approx. 10% of near-api-js)

## Features

* Transaction creation and signing
* Borsh serialization
* NEAR RPC calls with caching and retry logic
* Epoch information computation
* Utility functions for amount conversion
* TweetNacl cryptographic functions (sign/25519 curve)
* Smart contract interaction
* Network configuration

## Recent Improvements

* **Access Key Caching**: Reduces RPC calls by caching access key information
* **Enhanced RPC Calls**: Object-based parameters for better consistency
* **Debug Mode**: Built-in debug functionality for development
* **Epoch Utilities**: Compute current epoch information and timing
* **Additional Type Definitions**: Comprehensive TypeScript types
* **Amount Formatting**: Utilities for converting and formatting NEAR amounts

## TODO

* create near-api-lite-browser

### Differences from near-api-js:

* Smaller footprint, just core functionality, no dependencies
* Optimized for performance with caching mechanisms
* Enhanced error handling and retry logic
* bn.js
* json-rpc (minimal)
* near-rpc (minimal)

### What's extra

* base-smart-contract class to derive from
* NEP141 smart contract class to derive from
* NEP129 smart contract class to derive from

### What's not included

* KeyStores
* Providers
* Signers
* Connection, Account, NEAR-Wallet & Contracts Wrappers
* NEAR-Wallet navigate-to integration
* Validators abstractions
* Multisig abstractions

## Objective

This is a simpler API intended to include the minimal required API to interact with the NEAR blockchain

## Prerequisites:

- Current version of [Node.js](https://nodejs.org/). >=v14.0.0

## Setup:

1) Add to your project by running:
```bash
npm i near-api-lite
# or with yarn
yarn add near-api-lite
```

## Development:

To build the project:
```bash
yarn install
yarn build
```

Happy coding! 🚀
