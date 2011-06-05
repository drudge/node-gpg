
/*!
 * node-gpg
 * Copyright(c) 2011 Nicholas Penree <drudge@conceited.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn
  , stream = require('fs').createReadStream
  , writeStream = require('fs').createWriteStream
  , readFile = require('fs').readFile
  , pump = require('util').pump
  , exists = require('path').exists

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
    options = options || {};

    if (typeof options.source === 'undefined'){
      fn.call(null, new Error('Missing \'source\' option'));
      return;
    } else if (typeof options.dest === 'undefined'){
      fn.call(null, new Error('Missing \'dest\' option'));
      return;
    }

    exists(options.source, function(e){
      if (e){
        var buffer = new Buffer('')
          , fileStream = stream(options.source)
          , destStream = writeStream(options.dest)
          , gpg = spawn('gpg', ['--encrypt']);

        gpg.on('exit', function (code){
          fn.call(null,null);
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
   * @param {Function} Optional callback containing the encrypted string contents.
   * @api public
   */

  encrypt: function(str, fn){
    var buffer = new Buffer('')
      , gpg = spawn('gpg', ['--encrypt']);
    
    gpg.stdout.on('data', function (data){
      buffer.write(data.toString('utf8'));
    });
    gpg.on('exit', function (code){
      fn.call(null, null, buffer.toString('utf8'));
    });

    gpg.stdin.write(str);
  },

  /**
   * Dencrypt string `str` and pass the decrypted version to the callback `fn`.
   *
   * @param {String} str
   * @param {Function} Optional callback containing the decrypted string contents.
   * @api public
   */

  decrypt: function(str, fn){
    var buffer = ''
      , gpg = spawn('gpg', ['--decrypt']);
    
    gpg.stdout.on('data', function (data){
      buffer += data.toString('utf8');
    });
    gpg.on('exit', function (code){
      fn.call(null, null, buffer);
    });

    gpg.stdin.write(str);
    gpg.stdin.end();
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
    options = options || {};

    if (typeof options.source === 'undefined'){
      fn.call(null, new Error('Missing \'source\' option'));
      return;
    } else if (typeof options.dest === 'undefined'){
      fn.call(null, new Error('Missing \'dest\' option'));
      return;
    }

    exists(options.source, function(e){
      if (e){
        var buffer = new Buffer('')
          , fileStream = stream(options.source)
          , destStream = writeStream(options.dest)
          , gpg = spawn('gpg', ['--decrypt']);

        gpg.on('exit', function (code){
          fn.call(null,null);
        });

        pump(fileStream, gpg.stdin);
        pump(gpg.stdout, destStream);
      } else {
        fn.call(null, new Error(options.source + ' does not exist'));
      }
    });
  }, 
};

/**
 * Expose `GPG` object.
 */

module.exports = GPG;
