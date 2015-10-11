'use strict';

var spawn = require('child_process').spawn;
var globalArgs = ['--batch'];
var readStream = require('fs').createReadStream;
var writeStream = require('fs').createWriteStream;

/**
 * Wrapper around spawning GPG. Handles stdout, stderr, and default args.
 *
 * @param  {String}   input       Input string. Piped to stdin.
 * @param  {Array}    defaultArgs Default arguments for this task.
 * @param  {Array}    args        Arguments to pass to GPG when spawned.
 * @param  {Function} cb          Callback.
 */
module.exports = function(input, defaultArgs, args, cb) {
  // Allow calling with (input, defaults, cb)
  if (typeof args === 'function'){
    cb = args;
    args = [];
  }

  cb = once(cb);

  var gpgArgs = (args || []).concat(defaultArgs);
  var buffers = [];
  var buffersLength = 0;
  var error = '';
  var gpg = spawnIt(gpgArgs, cb);

  gpg.stdout.on('data', function (buf){
    buffers.push(buf);
    buffersLength += buf.length;
  });

  gpg.stderr.on('data', function(buf){
    error += buf.toString('utf8');
  });

  gpg.on('close', function(code){
    var msg = Buffer.concat(buffers, buffersLength);
    if (code !== 0) {
      // If error is empty, we probably redirected stderr to stdout (for verifySignature, import, etc)
      return cb(new Error(error || msg));
    }

    cb(null, msg);
  });

  gpg.stdin.end(input);
};

/**
 * Similar to spawnGPG, but sets up a read/write pipe to/from a file.
 *
 * @param  {Object}   options Options. Should have source and dest strings.
 * @param  {Array}    args    GPG args.
 * @param  {Function} cb      Callback
 */
module.exports.streaming = function(options, args, cb) {
  cb = once(cb);
  options = options || {};

  if (typeof options.source !== 'string'){
    return cb(new Error('Missing \'source\' option (string)'));
  } else if (typeof options.dest !== 'string'){
    return cb(new Error('Missing \'dest\' option (string)'));
  }

  // This will throw if the file doesn't exist
  var fileStream;
  try {
    fileStream = readStream(options.source);
  } catch(e) {
    return cb(new Error(options.source + ' does not exist. Error: ' + e.message));
  }

  var destStream;
  try {
    destStream = writeStream(options.dest);
  } catch(e) {
    return cb(new Error('Error opening ' + options.dest + '. Error: ' + e.message));
  }

  // Go for it
  var gpg = spawnIt(args, cb);

  gpg.on('close', function (code){
    cb(null);
  });

  // Pipe input file into gpg stdin; gpg stdout into output file..
  fileStream.pipe(gpg.stdin);
  gpg.stdout.pipe(destStream);
};

// Wrapper around spawn. Catches error events and passed global args.
function spawnIt(args, fn) {
  var gpg = spawn('gpg', (args || []).concat(globalArgs));
  gpg.on('error', fn);
  return gpg;
}

// Ensures a callback is only ever called once.
function once(fn) {
  var called = false;
  return function() {
    if (called) return;
    called = true;
    fn.apply(this, arguments);
  };
}
