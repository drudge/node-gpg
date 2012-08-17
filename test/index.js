var assert = require('assert')
  , gpg = require('../');
  
describe('gpg', function(){ 
  
  describe('encrypt', function(){
    it('should encrypt data', function(done){
      var mysecret = 'Hello World';
      var args = [
        '--trust-model', 'always', // disable trust checking for purposes of running tests
        '--no-use-agent'
      , '--batch'
      , '--default-key', 'D5762441'
      , '--recipient', 'D5762441'
      ];
      gpg.encrypt(mysecret, args, function(err, encrypted){
        assert.ifError(err);
        assert.ok(encrypted.length);
        done();
      });
    });
  });
  
  describe('clearsign', function(){
    it('should clearsign data', function(done){
      var mymessage = 'Hello, this is me!';
      var args = [
        '--trust-model', 'always', // disable trust checking for purposes of running tests
        '--no-use-agent'
      , '--batch'
      , '--default-key', 'D5762441'
      ];
      gpg.clearsign(mymessage, args, function(err, clearsigned){
        assert.ifError(err);
        assert.ok(clearsigned.length);
        done();
      });
    });
  });
  
});
