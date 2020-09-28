# GPG Encryption/Decryption in Node.js
[![ci][ci-image]][ci-url]
[![npm][npm-image]][npm-url]

[ci-image]: https://github.com/sdedovic/node-gpg-ts/workflows/Node.js%20Package/badge.svg
[ci-url]: https://github.com/sdedovic/node-gpg-ts/actions?workflow=Node.js+Package

[npm-image]: https://img.shields.io/npm/v/gpg-ts.svg?style=flat
[npm-url]: https://npmjs.org/package/gpg-ts

This is a port of the original [`node-gpg`](https://github.com/drudge/node-gpg) to TypeScript. It has been tested with Node 12 and TypeScript 3.9.

This module is a wrapper around `gpg` for use within Node. Node-GPG takes care of spawning `gpg`, passing it
the correct arguments, and piping input to stdin. It can also pipe input in from files and output out to files.

Use Node-GPG if you are considering calling `gpg` directly from your application.

## Requirements

In order to use Node-GPG, you'll need to have the `gpg` binary in your $PATH.

## Installation

    npm install gpg-ts

## Usage

Node-GPG supports both direct calls to GPG with string arguments, and streaming calls for piping input and output
from/to files.

See [the source](src/gpg.ts) for more details.

If a function you need is not implemented, you can call gpg directly with arguments of your choice by
calling `GPG.call(stdinStr, argsArray, cb)`, or `GPG.callStreaming(inputFileName, outputFileName, argsArray, cb)`.

## Notes

Existing implementations of PGP in Javascript are blocking and unfeasibly slow for server use.
In casual testing, encrypting a simple 400-character email to an El-Gamal key took upwards of 11 seconds using
[openpgpjs](https://github.com/openpgpjs/openpgpjs) and 14 seconds with [kbpgp](https://github.com/keybase/kbpgp),
but takes less than 0.1 seconds with `gpg` directly.

## Contributors

The following are the major contributors of `node-gpg` (in no specific order).

  * Nicholas Penree ([drudge](http://github.com/drudge))
  * [freewil](http://github.com/freewil)
  * Samuel Reed [strml](http://github.com/strml)
