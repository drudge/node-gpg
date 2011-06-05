/*!
 * node-gpg
 * Copyright(c) 2011 Nicholas Penree <drudge@conceited.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var gpg = require(__dirname + '/../lib/gpg')

gpg.encryptToFile({source:__dirname + '/../lib/gpg.js', dest: '/tmp/test.txt' }, function(err, data){
  console.log(err);
});
