var assert = require('assert')
  , gpg = require('../')
  , encryptedString = "-----BEGIN PGP MESSAGE-----\nVersion: GnuPG v1.4.11 (GNU/Linux)\n\nhIwDx4bi8LXf2bsBBACHzYpE/z18gwHTEQ0NZ9UjVozvslrQnyeNZYTBMZt3uxeQ\nqe2UX6k8M3wiODEuy+sOsOPnhKwdOkPSA2MwdJEcJTRLKsHvex/aysYYZPp7AW6Y\nBs4U7A4K+Jq706C/KJa9A1vRWrmrW92DL5huDppV0vdiqsSACmvnMXJzCJbqP9JH\nAcwEgyhAZdywmXKddMc5slU4knIs3Z+IHpbmkk6SChWlCCAiNXWNHKOf587VLU2G\nAntQfK6CB/3t8U5cNZ0uRwhrs+kwEkI=\n=82nc\n-----END PGP MESSAGE-----"
  ;
  
describe('gpg', function(){
  
  describe('encrypt', function(){
    it('should encrypt data', function(done){
      var mysecret = 'Hello World';
      var args = [
        '--trust-model', 'always'
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
  
  describe('decrypt', function(){
    it('should decrypt strings', function(done){
      var args = ['--trust-model', 'always'];
      gpg.decrypt(encryptedString, args, function(err, decrypted){
        assert.ifError(err);
        assert.ok(decrypted.length);
        assert.equal(decrypted.toString('utf8'), 'Hello World\n');
        done();
      });
    });
    
    it('should decrypt Buffers', function(done){
      var args = ['--trust-model', 'always'];
      var encryptedBuffer = new Buffer(encryptedString);
      gpg.decrypt(encryptedBuffer, args, function(err, decrypted){
        assert.ifError(err);
        assert.ok(decrypted.length);
        assert.equal(decrypted.toString('utf8'), 'Hello World\n');
        done();
      });
    });
  });
  
  describe('clearsign', function(){
    it('should clearsign data', function(done){
      var mymessage = 'Hello, this is me!';
      var args = [
        '--trust-model', 'always'
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
