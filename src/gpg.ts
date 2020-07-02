/*!
 * node-gpg-ts
 * Copyright(c) 2020 Stevan Dedovic
 * MIT Licensed
 *
 * node-gpg-ts was ported from node-gpg
 * Copyright(c) 2011 Nicholas Penree <drudge@conceited.net>
 * MIT Licensed
 */


import * as fs from 'fs';
import {Opts, spawnGPG, spawnStreamingGPG} from './spawnGPG';
import {Readable, Writable} from "stream";
import {PathLike} from "fs";
import ErrnoException = NodeJS.ErrnoException;
const keyRegex = /key (.*?):/;

export class GPG {

  /**
   * Raw call to gpg.
   *
   * @param  {String}   stdin  String to send to stdin.
   * @param  {Array}    [args] Array of arguments.
   * @param  {Function} [fn]   Callback.
   * @api public
   */
  static call(stdin: string, args: string[], fn: (err: Error, msg: Buffer, error: string) => void): void {
    spawnGPG(stdin, args, [], fn);
  }

  /**
   * Raw streaming call to gpg. Reads from input file and writes to output file.
   *
   * @param input
   * @param output
   * @param  {Array}    [args]         Array of arguments.
   * @param  {Function} [fn]           Callback.
   * @api public
   */
  static callStreaming(input: string | Readable, output: string | Writable, args: string[], fn: (err: Error, msg: Writable) => void): void {
    spawnStreamingGPG({source: input, dest: output}, args, fn);
  }

  /**
   * Encrypt source file passed as `options.source` and store it in a file specified in `options.dest`.
   *
   * @param {Opts}   options  Should contain 'source' and 'dest' keys.
   * @param {Function} [fn]     Callback.
   * @api public
   */
  static encryptToFile(options: Opts, fn: (err: Error, msg: Writable) => void): void {
    spawnStreamingGPG(options, ['--encrypt'], fn);
  }

  /**
   * Encrypt source `file` and pass the encrypted contents to the callback `fn`.
   *
   * @param {PathLike}   file   Filename.
   * @param {Function} [fn]   Callback containing the encrypted file contents.
   * @api public
   */
  static encryptFile(file: PathLike, fn: (err: Error, msg: Buffer, error: string) => void): void {
    fs.readFile(file, (err, data) => {
      if (err) fn(err, null, null);
      else GPG.encrypt(data, [], fn);
    });
  }

  /**
   * Encrypt source stream passed as `options.source` and pass it to the stream specified in `options.dest`.
   * Is basically the same method as `encryptToFile()`.
   *
   * @param {Opts}   options  Should contain 'source' and 'dest' keys that are streams.
   * @param {Function} [fn]     Callback.
   * @api public
   */
  static encryptToStream(options: Opts, fn: (err: Error, msg: Writable) => void) {
    spawnStreamingGPG(options, ['--encrypt'], fn);
  }

  /**
   * Encrypt source `stream` and pass the encrypted contents to the callback `fn`.
   *
   * @param {ReadableStream} stream Stream to read from.
   * @param {Array}          [args] Array of additonal gpg arguments.
   * @param {Function}       [fn]   Callback containing the encrypted file contents.
   * @api public
   */
  static encryptStream(stream: Readable, args: string[], fn: (err: Error, msg: Buffer, error: string) => void) {
    const chunks: Buffer[] = [];

    stream.on('data', function (chunk){
      chunks.push(chunk);
    });

    stream.on('end', function (){
      GPG.encrypt(Buffer.concat(chunks), args, fn);
    });

    stream.on('error', fn);
  }

  /**
   * Encrypt `str` and pass the encrypted version to the callback `fn`.
   *
   * @param {String|Buffer}   str    String to encrypt.
   * @param {Array}    [args] Array of additonal gpg arguments.
   * @param {Function} [fn]   Callback containing the encrypted Buffer.
   * @api public
   */
  static encrypt(str: string | Buffer, args: string[], fn: (err: Error, msg: Buffer, error: string) => void) {
    spawnGPG(str, ['--encrypt'], args, fn);
  }

  /**
   * Decrypt `str` and pass the decrypted version to the callback `fn`.
   *
   * @param {String|Buffer} str    Data to decrypt.
   * @param {Array}         [args] Array of additonal gpg arguments.
   * @param {Function}      [fn]   Callback containing the decrypted Buffer.
   * @api public
   */
  static decrypt(str: string | Buffer, args: string[], fn: (err: Error, msg: Buffer, error: string) => void) {
    spawnGPG(str, ['--decrypt'], args, fn)
  }

  /**
   * Decrypt source `file` and pass the decrypted contents to the callback `fn`.
   *
   * @param {PathLike}   file Filename.
   * @param {Function} fn   Callback containing the decrypted file contents.
   * @api public
   */
  static decryptFile(file: PathLike, fn: (err: Error, msg: Buffer, error: string) => void) {
    fs.readFile(file, (err, content) => {
      if (err)
        return fn(err, null, null);
      else
        return GPG.decrypt(content, [], fn);
    });
  }

  /**
   * Decrypt source file passed as `options.source` and store it in a file specified in `options.dest`.
   *
   * @param {Opts}   options  Should contain 'source' and 'dest' keys.
   * @param {Function} fn       Callback
   * @api public
   */
  static decryptToFile(options: Opts, fn: (err: Error, msg: Writable) => void) {
    spawnStreamingGPG(options, ['--decrypt'], fn);
  }

  /**
   * Decrypt source `stream` and pass the decrypted contents to the callback `fn`.
   *
   * @param {ReadableStream} stream Stream to read from.
   * @param {Array}          [args] Array of additonal gpg arguments.
   * @param {Function}       [fn]   Callback containing the decrypted file contents.
   * @api public
   */
  static decryptStream(stream: Readable, args: string[], fn: (err: Error, msg: Buffer, error: string) => void) {
    const chunks: Buffer[] = [];

    stream.on('data', function (chunk){
      chunks.push(chunk);
    });

    stream.on('end', function (){
      GPG.decrypt(Buffer.concat(chunks), args, fn);
    });

    stream.on('error', fn);
  }

  /**
   * Decrypt source stream passed as `options.source` and pass it to the stream specified in `options.dest`.
   * This is basically the same method as `decryptToFile()`.
   *
   * @param {Opts}   options  Should contain 'source' and 'dest' keys that are streams.
   * @param {Function} fn       Callback
   * @api public
   */
  static decryptToStream(options: Opts, fn: (err: Error, msg: Writable) => void) {
    spawnStreamingGPG(options, ['--decrypt'], fn);
  }

  /**
   * Clearsign `str` and pass the signed message to the callback `fn`.
   *
   * @param {String|Buffer} str  String to clearsign.
   * @param {Array}         [args] Array of additonal gpg arguments.
   * @param {Function}      fn   Callback containing the signed message Buffer.
   * @api public
   */
  static clearsign(str: string | Buffer, args: string[], fn: (err: Error, msg: Buffer, error: string) => void) {
    spawnGPG(str, ['--clearsign'], args, fn);
  }

  /**
   * Verify `str` and pass the output to the callback `fn`.
   *
   * @param {String|Buffer} str    Signature to verify.
   * @param {Array}         [args] Array of additonal gpg arguments.
   * @param {Function}      [fn]   Callback containing the signed message Buffer.
   * @api public
   */
  static verifySignature(str: string | Buffer, args: string[], fn: (err: Error, msg: Buffer, error: string) => void) {
    // Set logger fd, verify otherwise outputs to stderr for whatever reason
    const defaultArgs = ['--logger-fd', '1', '--verify'];
    spawnGPG(str, defaultArgs, args, fn);
  }

  /**
   * Add a key to the keychain by filename.
   *
   * @param {PathLike}  fileName  Key filename.
   * @param {Array}   [args]    Array of additonal gpg arguments.
   * @param {Function} [fn]     Callback containing the signed message Buffer.
   * @api public
   */
  static importKeyFromFile(fileName: PathLike, args: string[], fn: (err: Error | ErrnoException, msg: string, error: string) => void) {
    fs.readFile(fileName, (readErr, str) => {
      if (readErr) fn(readErr, null, null);
      else GPG.importKey(str.toString("utf-8"), args, fn);
    });
  }

  /**
   * Add an ascii-armored key to gpg. Expects the key to be passed as input.
   *
   * @param {String | Buffer}   keyStr  Key string (armored).
   * @param {Array}    args    Optional additional arguments to pass to gpg.
   * @param {Function} fn      Callback containing the signed message Buffer.
   * @api public
   */
  static importKey(keyStr: string | Buffer, args: string[], fn: (err: Error, msg: string, error: string) => void) {
    // Set logger fd, verify otherwise outputs to stderr for whatever reason
    const defaultArgs = ['--logger-fd', '1', '--import'];

    let resultStr: string;
    spawnGPG(keyStr, defaultArgs, args, (importError, result) => {
      if (importError) {
        // Ignorable errors
        if (/already in secret keyring/.test(importError.message)) {
          resultStr = importError.message;
        } else {
          fn(importError, null, null);
        }
      } else {
        // Grab key fingerprint and send it back as second arg
        const match = result.toString().match(keyRegex);
        fn(null, resultStr || result.toString(), match && match[1]);
      }
    });
  }

  /**
   * Removes a key by fingerprint. Warning: this will remove both pub and privkeys!
   *
   * @param {String}   keyID  Key fingerprint.
   * @param {Array}    [args] Array of additonal gpg arguments.
   * @param {Function} fn     Callback containing the signed message Buffer.
   * @api public
   */
  static removeKey(keyID: string, args: string[], fn: (err: Error, msg: Buffer, error: string) => void) {
    // Set logger fd, verify otherwise outputs to stderr for whatever reason
    const defaultArgs = ['--logger-fd', '1', '--delete-secret-and-public-key'];
    spawnGPG(keyID, defaultArgs, args, fn);
  }
}
