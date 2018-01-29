# GPG Encryption/Decryption in Node.js
[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]

[travis-image]: https://travis-ci.org/drudge/node-gpg.svg?branch=master
[travis-url]: https://travis-ci.org/drudge/node-gpg

[npm-image]: https://img.shields.io/npm/v/gpg.svg?style=flat
[npm-url]: https://npmjs.org/package/gpg

[downloads-image]: https://img.shields.io/npm/dm/gpg.svg?style=flat
[downloads-url]: https://npmjs.org/package/gpg

This module is a wrapper around `gpg` for use within Node. Node-GPG takes care of spawning `gpg`, passing it
the correct arguments, and piping input to stdin. It can also pipe input in from files and output out to files.

Use Node-GPG if you are considering calling `gpg` directly from your application.

## Requirements

In order to use Node-GPG, you'll need to have the `gpg` binary in your $PATH.

## Installation

    npm install gpg

## Usage

Node-GPG supports both direct calls to GPG with string arguments, and streaming calls for piping input and output
from/to files.

See [the source](lib/gpg.js) for more details.

If a function you need is not implemented, you can call gpg directly with arguments of your choice by
calling `gpg.call(stdinStr, argsArray, cb)`, or `gpg.callStreaming(inputFileName, outputFileName, argsArray, cb)`.

## Promises

All methods return promises. If you pass a callback as well as promise chaining then no promises will be rejected
for safety when using callback pattern.

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
