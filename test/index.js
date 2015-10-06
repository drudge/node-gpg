var assert = require('assert');
var gpg = require('../');
var path = require('path');
var fs = require('fs');
var encryptedString;

/*global describe,it*/
describe('gpg', function(){

  describe('import keys', function() {
    it('should import the pubkey from file for the remaining tests', function(done) {
      gpg.importKeyFromFile(path.join(__dirname, 'test.pub.asc'), function(err, result, fingerprint) {
        assert.ifError(err);
        assert.ok(/Total number processed: 1/.test(result));
        assert.ok(/key 6F20F59D:/.test(result));
        assert.ok(fingerprint === '6F20F59D');
        done();
      });
    });

    it('should import the privkey as string for the remaining tests', function(done) {
      fs.readFile(path.join(__dirname, 'test.priv.asc'), function(err, file) {
        assert.ifError(err);
        gpg.importKey(file, function(importErr, result, fingerprint) {
          assert.ifError(importErr);
          assert.ok(/secret keys read: 1/.test(result));
          assert.ok(/key 6F20F59D:/.test(result));
          assert.ok(fingerprint === '6F20F59D');
          done();
        });
      });
    });

    it('importing a missing file errors', function(done) {
      gpg.importKeyFromFile(path.join(__dirname, 'test.pub.asc1'), function(err, result) {
        assert.ok(err);
        assert.ok(err.code === 'ENOENT');
        done();
      });
    });

    it('importing a malformed file errors', function(done) {
      gpg.importKeyFromFile(path.join(__dirname, 'index.js'), function(err, result) {
        assert.ok(err);
        assert.ok(/no valid OpenPGP data found/.test(err.message));
        done();
      });
    });
  });

  describe('encrypt', function(){
    it('should encrypt data', function(done){
      var mysecret = 'Hello World';
      var args = [
        '--default-key', '6F20F59D',
        '--recipient', '6F20F59D',
        '--armor',
        '--trust-model', 'always' // so we don't get "no assurance this key belongs to the given user"
      ];
      gpg.encrypt(mysecret, args, function(err, encrypted){
        assert.ifError(err);
        assert.ok(encrypted.length);
        encryptedString = encrypted.toString();
        assert.ok(/BEGIN PGP MESSAGE/.test(encryptedString));
        done();
      });
    });
  });

  describe('decrypt', function(){
    it('should decrypt strings', function(done){
      gpg.decrypt(encryptedString, function(err, decrypted){
        assert.ifError(err);
        assert.ok(decrypted.length);
        assert.equal(decrypted.toString('utf8'), 'Hello World');
        done();
      });
    });

    it('should decrypt Buffers', function(done){
      var encryptedBuffer = new Buffer(encryptedString);
      gpg.decrypt(encryptedBuffer, function(err, decrypted){
        assert.ifError(err);
        assert.ok(decrypted.length);
        assert.equal(decrypted.toString('utf8'), 'Hello World');
        done();
      });
    });
  });

  describe('clearsign', function(){
    it('should clearsign data', function(done){
      var mymessage = 'Hello, this is me!';
      var args = [
        '--trust-model', 'always'
      , '--default-key', '6F20F59D'
      ];
      gpg.clearsign(mymessage, args, function(err, clearsigned){
        assert.ifError(err);
        assert.ok(clearsigned.length);
        done();
      });
    });
  });

  describe('verifying signature', function(){
    it('should verify signature on data', function(done){
      var mymessage = 'Hello, this is me!';
      var args = [
        '--trust-model', 'always'
      , '--default-key', '6F20F59D'
      ];
      gpg.clearsign(mymessage, args, function(err, clearsigned){
        assert.ifError(err);
        assert.ok(clearsigned.length);
        gpg.verifySignature(clearsigned, function(verifyErr, result) {
          assert.ifError(verifyErr);
          assert.ok(/good signature/i, result.toString());
          done();
        });
      });
    });
  });

  describe('remove keys', function() {
    it('should remove both keys', function(done) {
      gpg.removeKey('6F20F59D', function(err, result) {
        assert.ifError(err);
        console.log(result.toString());
        done();
      });
    });
  });

});
