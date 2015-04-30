/*!
 * node-gpg
 * Copyright(c) 2011 Nicholas Penree <drudge@conceited.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn
  , fs = require('fs')
  , stream = fs.createReadStream
  , writeStream = fs.createWriteStream
  , readFile = fs.readFile
  , pump = require('util').pump
  , exists = require('path').exists
  , globalArgs = ['--no-use-agent', '--batch']
  ;

/**
 * Base `GPG` object.
 */

var GPG = {

  /**
   * Encrypt source file passed as `options.source` and store it in a file specified in `options.dest`.
   *
   * @param {Object} options
   * @param {Function} Optional callback
   * @api public
   */

  encryptToFile: function(options, fn){
    var self = this
      , defaultArgs = globalArgs.concat(['--encrypt']);
    options = options || {};

    if (typeof options.source === 'undefined'){
      return fn.call(null, new Error('Missing \'source\' option'));
    } else if (typeof options.dest === 'undefined'){
      return fn.call(null, new Error('Missing \'dest\' option'));
    }
    if (typeof options.args !== 'undefined') {
      defaultArgs.concat(options.args);
    }

    self.exists(options.source, function(e){
      if (e){
        var buffer = new Buffer('')
          , fileStream = stream(options.source)
          , destStream = writeStream(options.dest)
          , gpg = spawn('gpg', defaultArgs);

        gpg.on('close', function (code){
          fn.call(null, null);
        });

        pump(fileStream, gpg.stdin);
        pump(gpg.stdout, destStream);
      } else {
        fn.call(null, new Error(options.source + ' does not exist', null));
      }
    });
  },

  /**
   * Encrypt source `file` and pass the encrypted contents to the callback `fn`.
   *
   * @param {String} file
   * @param {Function} Optional callback containing the encrypted file contents.
   * @api public
   */

  encryptFile: function(file, fn){
    var self = this;

    readFile(file, function(err, content){
      self.encrypt(content, function(err, data){
        fn.call(null, err, data);
      });
    });
  },

  /**
   * Encrypt string `str` and pass the encrypted version to the callback `fn`.
   *
   * @param {String} str
   * @param {Array} args Optional array of additonal gpg arguments.
   * @param {Function} fn Optional callback containing the encrypted Buffer.
   * @api public
   */

  encrypt: function(str, args, fn){
    var defaultArgs = globalArgs.concat(['--encrypt']);
    if (typeof args === 'function'){
      fn = args;
      args = defaultArgs;
    } else {
      args = defaultArgs.concat(args);
    }

    var buffers = []
      , buffersLength = 0
      , error = ''
      , gpg = spawn('gpg', args);

    gpg.stdout.on('data', function (buf){
      buffers.push(buf);
      buffersLength += buf.length;
    });

    gpg.stderr.on('data', function(buf){
      error += buf.toString('utf8');
    });

    gpg.on('close', function (code){
      if (code !== 0) {
        return fn.call(null, new Error(error));
      }

      // concatenate all buffers together
      var buffer = new Buffer(buffersLength)
        , targetStart = 0;
      buffers.forEach(function(b){
        b.copy(buffer, targetStart);
        targetStart += b.length
      });
      fn.call(null, null, buffer);
    });

    gpg.stdin.end(str);
  },

  /**
   * Decrypt `str` and pass the decrypted version to the callback `fn`.
   *
   * @param {String|Buffer} str
   * @param {Array} args Optional array of additonal gpg arguments.
   * @param {Function} fn Optional callback containing the decrypted Buffer.
   * @api public
   */

  decrypt: function(str, args, fn){
    var defaultArgs = globalArgs.concat(['--decrypt']);
    if (typeof args === 'function'){
      fn = args;
      args = defaultArgs;
    } else {
      args = defaultArgs.concat(args);
    }

    var buffers = []
      , buffersLength = 0
      , error = ''
      , gpg = spawn('gpg', args);

    gpg.stdout.on('data', function (buf){
      buffers.push(buf);
      buffersLength += buf.length;
    });

    gpg.stderr.on('data', function (data){
      error += data.toString('utf8');
    });

    gpg.on('close', function (code){
      if (code !== 0){
        return fn.call(null, new Error(error));
      }

      // concatenate all buffers together
      var buffer = new Buffer(buffersLength)
        , targetStart = 0;
      buffers.forEach(function(b){
        b.copy(buffer, targetStart);
        targetStart += b.length
      });
      fn.call(null, null, buffer);
    });

    gpg.stdin.end(str);
  },

  /**
   * Decrypt source `file` and pass the decrypted contents to the callback `fn`.
   *
   * @param {String} file
   * @param {Function} Optional callback containing the decrypted file contents.
   * @api public
   */

  decryptFile: function(file, fn){
    var self = this;

    readFile(file, function(err, content){
      self.decrypt(content, function(err, data){
        fn.call(null, err, data);
      });
    });
  },

  /**
   * Decrypt source file passed as `options.source` and store it in a file specified in `options.dest`.
   *
   * @param {Object} options
   * @param {Function} Optional callback
   * @api public
   */

  decryptToFile: function(options, fn){
    var self = this
      , defaultArgs = globalArgs.concat(['--decrypt']);
    options = options || {};

    if (typeof options.source === 'undefined'){
      return fn.call(null, new Error('Missing \'source\' option'));
    } else if (typeof options.dest === 'undefined'){
      return fn.call(null, new Error('Missing \'dest\' option'));
    }
    if (typeof options.args !== 'undefined') {
      defaultArgs.concat(options.args);
    }

    self.exists(options.source, function(e){
      if (e){
        var buffer = new Buffer('')
          , fileStream = stream(options.source)
          , destStream = writeStream(options.dest)
          , gpg = spawn('gpg', defaultArgs);

        gpg.on('close', function (code){
          fn.call(null, null);
        });

        pump(fileStream, gpg.stdin);
        pump(gpg.stdout, destStream);
      } else {
        fn.call(null, new Error(options.source + ' does not exist'));
      }
    });
  },

  /**
   * Clearsign `str` and pass the signed message to the callback `fn`.
   *
   * @param {String|Buffer} str
   * @param {Array} args Optional additional arguments to pass to gpg.
   * @param {Function} callback containing the signed message Buffer.
   * @api public
   */

  clearsign: function(str, args, fn){
    var defaultArgs = globalArgs.concat(['--clearsign']);
    if (typeof args === 'function'){
      fn = args;
      args = defaultArgs;
    } else {
      args = defaultArgs.concat(args);
    }

    var buffers = []
      , buffersLength = 0
      , error = ''
      , gpg = spawn('gpg', args);

    gpg.stdout.on('data', function(buf){
      buffers.push(buf);
      buffersLength += buf.length;
    });

    gpg.stderr.on('data', function(data){
      error += data.toString('utf8');
    });

    gpg.on('close', function(code){
      if (code !== 0) {
        return fn.call(null, new Error(error));
      }

      // concatenate all buffers together
      var buffer = new Buffer(buffersLength)
        , targetStart = 0;
      buffers.forEach(function(b){
        b.copy(buffer, targetStart);
        targetStart += b.length
      });

      fn.call(null, null, buffer);
    });

    gpg.stdin.end(str);
  },

  /**
   * Replace past.exists method since removed and fs.exists is deprecated.
   *
   * @param {String} filePath
   * @param {Function} callback to handle error.
   * @api public
   */
  exists:  function (filePath, fn) {
    var exists = false
      , stats = fs.statSync(filePath);
      if (stats.isFile()) {
        exists = true;
      }
      fn(exists);
    }
  }

};

/**
 * Expose `GPG` object.
 */

module.exports = GPG;
