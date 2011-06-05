/*!
 * node-gpg
 * Copyright(c) 2011 Nicholas Penree <drudge@conceited.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var gpg = require(__dirname + '/../lib/gpg')

gpg.decryptFile('/tmp/test.txt', function(err, contents){
  console.log(contents);
});
