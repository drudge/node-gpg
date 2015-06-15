# GPG Encryption/Decryption in Node.js [![Build Status](https://travis-ci.org/drudge/node-gpg.svg?branch=master)](https://travis-ci.org/drudge/node-gpg)

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

## License

(The MIT License)

Copyright (c) 2015 Nicholas Penree &lt;drudge@conceited.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

