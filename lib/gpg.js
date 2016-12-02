/*!
 * node-gpg
 * Copyright(c) 2011 Nicholas Penree <drudge@conceited.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var fs = require('fs');
var spawnGPG = require('./spawnGPG');
var keyRegex = /^gpg: key (.*?):/;

/**
 * Base `GPG` object.
 */
var GPG = {

  /**
   * Raw call to gpg.
   *
   * @param  {String}   stdin  String to send to stdin.
   * @param  {Array}    [args] Array of arguments.
   * @param  {Function} [fn]   Callback.
   * @api public
   */
  call: function(stdin, args, fn) {
    spawnGPG(stdin, args, fn);
  },

  /**
   * Raw streaming call to gpg. Reads from input file and writes to output file.
   *
   * @param  {String}   inputFileName  Name of input file.
   * @param  {String}   outputFileName Name of output file.
   * @param  {Array}    [args]         Array of arguments.
   * @param  {Function} [fn]           Callback.
   * @api public
   */
  callStreaming: function(inputFileName, outputFileName, args, fn) {
    spawnGPG.streaming({source: inputFileName, dest: outputFileName}, args, fn);
  },

  /**
   * Encrypt source file passed as `options.source` and store it in a file specified in `options.dest`.
   *
   * @param {Object}   options  Should contain 'source' and 'dest' keys.
   * @param {Function} [fn]     Callback.
   * @api public
   */
  encryptToFile: function (options, fn){
    spawnGPG.streaming(options, ['--encrypt'], fn);
  },

  /**
   * Encrypt source `file` and pass the encrypted contents to the callback `fn`.
   *
   * @param {String}   file   Filename.
   * @param {Function} [fn]   Callback containing the encrypted file contents.
   * @api public
   */
  encryptFile: function(file, fn){
    var self = this;

    fs.readFile(file, function(err, content){
      if (err) return fn(err);
      self.encrypt(content, fn);
    });
  },

  /**
   * Encrypt source stream passed as `options.source` and pass it to the stream specified in `options.dest`.
   * Is basicaly the same method as `encryptToFile()`.
   *
   * @param {Object}   options  Should contain 'source' and 'dest' keys that are streams.
   * @param {Function} [fn]     Callback.
   * @api public
   */
  encryptToStream: function (options, fn){
    spawnGPG.streaming(options, ['--encrypt'], fn);
  },

  /**
   * Encrypt source `stream` and pass the encrypted contents to the callback `fn`.
   *
   * @param {ReadableStream} stream Stream to read from.
   * @param {Array}          [args] Array of additonal gpg arguments.
   * @param {Function}       [fn]   Callback containing the encrypted file contents.
   * @api public
   */
  encryptStream: function (stream, args, fn){
    var self   = this;
    var chunks = [];

    stream.on('data', function (chunk){
      chunks.push(chunk);
    });

    stream.on('end', function (){
      self.encrypt(Buffer.concat(chunks), args, fn);
    });

    stream.on('error', fn);
  },

  /**
   * Encrypt `str` and pass the encrypted version to the callback `fn`.
   *
   * @param {String|Buffer}   str    String to encrypt.
   * @param {Array}    [args] Array of additonal gpg arguments.
   * @param {Function} [fn]   Callback containing the encrypted Buffer.
   * @api public
   */
  encrypt: function(str, args, fn){
    spawnGPG(str, ['--encrypt'], args, fn);
  },

  /**
   * Decrypt `str` and pass the decrypted version to the callback `fn`.
   *
   * @param {String|Buffer} str    Data to decrypt.
   * @param {Array}         [args] Array of additonal gpg arguments.
   * @param {Function}      [fn]   Callback containing the decrypted Buffer.
   * @api public
   */
  decrypt: function(str, args, fn){
    spawnGPG(str, ['--decrypt'], args, fn);
  },

  /**
   * Decrypt source `file` and pass the decrypted contents to the callback `fn`.
   *
   * @param {String}   file Filename.
   * @param {Function} fn   Callback containing the decrypted file contents.
   * @api public
   */
  decryptFile: function(file, fn){
    var self = this;

    fs.readFile(file, function(err, content){
      if (err) return fn(err);
      self.decrypt(content, fn);
    });
  },

  /**
   * Decrypt source file passed as `options.source` and store it in a file specified in `options.dest`.
   *
   * @param {Object}   options  Should contain 'source' and 'dest' keys.
   * @param {Function} fn       Callback
   * @api public
   */
  decryptToFile: function (options, fn){
    spawnGPG.streaming(options, ['--decrypt'], fn);
  },

  /**
   * Decrypt source `stream` and pass the decrypted contents to the callback `fn`.
   *
   * @param {ReadableStream} stream Stream to read from.
   * @param {Array}          [args] Array of additonal gpg arguments.
   * @param {Function}       [fn]   Callback containing the decrypted file contents.
   * @api public
   */
  decryptStream: function(stream, args, fn){
    var self   = this;
    var chunks = [];

    stream.on('data', function (chunk){
      chunks.push(chunk);
    });

    stream.on('end', function (){
      self.decrypt(Buffer.concat(chunks), args, fn);
    });

    stream.on('error', fn);
  },

  /**
   * Decrypt source stream passed as `options.source` and pass it to the stream specified in `options.dest`.
   * This is basicaly the same method as `decryptToFile()`.
   *
   * @param {Object}   options  Should contain 'source' and 'dest' keys that are streams.
   * @param {Function} fn       Callback
   * @api public
   */
  decryptToStream: function (options, fn){
    spawnGPG.streaming(options, ['--decrypt'], fn);
  },

  /**
   * Clearsign `str` and pass the signed message to the callback `fn`.
   *
   * @param {String|Buffer} str  String to clearsign.
   * @param {Array}         [args] Array of additonal gpg arguments.
   * @param {Function}      fn   Callback containing the signed message Buffer.
   * @api public
   */
  clearsign: function(str, args, fn){
    spawnGPG(str, ['--clearsign'], args, fn);
  },

  /**
   * Verify `str` and pass the output to the callback `fn`.
   *
   * @param {String|Buffer} str    Signature to verify.
   * @param {Array}         [args] Array of additonal gpg arguments.
   * @param {Function}      [fn]   Callback containing the signed message Buffer.
   * @api public
   */
  verifySignature: function(str, args, fn){
    // Set logger fd, verify otherwise outputs to stderr for whatever reason
    var defaultArgs = ['--logger-fd', '1', '--verify'];
    spawnGPG(str, defaultArgs, args, fn);
  },

  /**
   * Add a key to the keychain by filename.
   *
   * @param {String}  fileName  Key filename.
   * @param {Array}   [args]    Array of additonal gpg arguments.
   * @param {Function} [fn]     Callback containing the signed message Buffer.
   * @api public
   */
  importKeyFromFile: function(fileName, args, fn){
    if (typeof args === 'function') {
      fn = args;
      args = [];
    }

    var self = this;

    fs.readFile(fileName, function(readErr, str) {
      if (readErr) return fn(readErr);
      self.importKey(str, args, fn);
    });
  },

  /**
   * Add an ascii-armored key to gpg. Expects the key to be passed as input.
   *
   * @param {String}   keyStr  Key string (armored).
   * @param {Array}    args    Optional additional arguments to pass to gpg.
   * @param {Function} fn      Callback containing the signed message Buffer.
   * @api public
   */
  importKey: function(keyStr, args, fn){
    if (typeof args === 'function') {
      fn = args;
      args = [];
    }

    // Set logger fd, verify otherwise outputs to stderr for whatever reason
    var defaultArgs = ['--logger-fd', '1', '--import'];

    spawnGPG(keyStr, defaultArgs, args, function(importError, result) {
      if (importError) {
        // Ignorable errors
        if (/already in secret keyring/.test(importError.message)) {
          result = importError.message;
        } else {
          return fn(importError);
        }
      }
      // Grab key fingerprint and send it back as second arg
      var match = result.toString().match(keyRegex);
      fn(null, result.toString(), match && match[1]);
    });
  },

  /**
   * Removes a key by fingerprint. Warning: this will remove both pub and privkeys!
   *
   * @param {String}   keyID  Key fingerprint.
   * @param {Array}    [args] Array of additonal gpg arguments.
   * @param {Function} fn     Callback containing the signed message Buffer.
   * @api public
   */
  removeKey: function(keyID, args, fn){
    // Set logger fd, verify otherwise outputs to stderr for whatever reason
    var defaultArgs = ['--logger-fd', '1', '--delete-secret-and-public-key'];
    spawnGPG(keyID, defaultArgs, args, fn);
  }

};

/**
 * Expose `GPG` object.
 */
module.exports = GPG;
