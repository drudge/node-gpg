import {ChildProcess, spawn} from 'child_process';
import { createReadStream, createWriteStream } from "fs";
import { Readable, Stream, Writable } from 'stream';
import * as _ from 'lodash';

const globalArgs = ['--batch'];

/**
 * Wrapper around spawning GPG. Handles stdout, stderr, and default args.
 *
 * @param  {String}   input       Input string. Piped to stdin.
 * @param  {Array}    defaultArgs Default arguments for this task.
 * @param  {Array}    args        Arguments to pass to GPG when spawned.
 * @param  {Function} cb          Callback. Last parameter of the callback is stderr.
 */
export function spawnGPG(input: string | Buffer, defaultArgs: string[], args: string[], cb: (err: Error, msg: Buffer, error: string) => void) {

  cb = _.once(cb);

  const gpgArgs = (args || []).concat(defaultArgs);
  let buffers: Buffer[] = [];
  let buffersLength = 0;
  let error = '';
  const gpg = spawnIt(gpgArgs, cb);

  gpg.stdout.on('data', function (buf: Buffer){
    buffers.push(buf);
    buffersLength += buf.length;
  });

  gpg.stderr.on('data', function(buf: Buffer){
    error += buf.toString('utf8');
  });

  gpg.on('close', function(code){
    const msg = Buffer.concat(buffers, buffersLength);
    if (code !== 0) {
      // If error is empty, we probably redirected stderr to stdout (for verifySignature, import, etc)
      return cb(new Error(error || msg.toString('utf-8')), msg, error);
    }

    cb(null, msg, error);
  });

  gpg.stdin.end(input);
}

/**
 * Similar to spawnGPG, but sets up a read/write pipe to/from a stream.
 *
 * @param  {Object}   options Options. Should have source and dest strings or streams.
 * @param  {Array}    args    GPG args.
 * @param  {Function} cb      Callback
 */
export function spawnStreamingGPG(options: Opts, args: string[], cb: (err: Error, stream: Writable) => void) {
  cb = _.once(cb);
  options = options || {};

  if (typeof options.source !== 'string' && !isStream(options.source)){
    return cb(new Error('Missing \'source\' option (string or stream)'), null);
  } else if (typeof options.dest !== 'string' && !isStream(options.dest)){
    return cb(new Error('Missing \'dest\' option (string or stream)'), null);
  }

  let sourceStream: Readable;
  if (!isReadable(options.source)) {
    // This will throw if the file doesn't exist
    try {
      sourceStream = createReadStream(options.source);
    } catch(e) {
      return cb(new Error(options.source + ' does not exist. Error: ' + e.message), null);
    }
  } else {
    sourceStream = options.source;
  }

  let destStream: Writable;
  if (!isWritable(options.dest)) {
    try {
      destStream = createWriteStream(options.dest);
    } catch(e) {
      return cb(new Error('Error opening ' + options.dest + '. Error: ' + e.message), null);
    }
  } else {
    destStream = options.dest;
  }

  // Go for it
  const gpg = spawnIt(args, cb);

  if (!isStream(options.dest)) {
    gpg.on('close', code => {
      cb(null, null);
    });
  } else {
    cb(null, destStream);
  }

  // Pipe input file into gpg stdin; gpg stdout into output file..
  sourceStream.pipe(gpg.stdin);
  gpg.stdout.pipe(destStream);
}

// Wrapper around spawn. Catches error events and passed global args.
function spawnIt(args: string[], fn: (err: Error, msg?: Buffer | Writable, error?: string) => void): ChildProcess {
  const gpg = spawn('gpg', globalArgs.concat(args || []));
  gpg.on('error', err => {
    fn(err, null, null);
  });
  return gpg;
}

// Check if input is stream with duck typing
function isStream(stream: any): stream is Stream {
  return stream != null && typeof stream === 'object' && typeof stream.pipe === 'function';
}

function isReadable(stream: any): stream is Readable {
  return stream != null && typeof stream === 'object' && typeof stream.pipe === 'function' && typeof stream.read === 'function';
}

function isWritable(stream: any): stream is Writable {
  return stream != null && typeof stream === 'object' && typeof stream.pipe === 'function' && typeof stream.write === 'function';
}

export interface Opts {
  source?: string | Readable;
  dest?: string | Writable;
}