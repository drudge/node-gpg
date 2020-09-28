import {GPG} from "../src/gpg";

import * as path from 'path';
import * as fs from 'fs';
import {Stream} from 'stream';
import ErrnoException = NodeJS.ErrnoException;

let encryptedString: string = '';

/*global describe,it*/
describe('GPG', () => {

  describe('import keys', () => {
    it('should import the pubkey from file for the remaining tests', done => {
      GPG.importKeyFromFile(path.join(__dirname, 'test.pub.asc'), [],(err, result, fingerprint) => {
        expect(result).toMatch(/Total number processed: 1/);
        expect(result).toMatch(/key 833744386F20F59D:/);
        expect(fingerprint).toBe('833744386F20F59D');
        done();
      });
    });

    it('should import the privkey as string for the remaining tests', done => {
      fs.readFile(path.join(__dirname, 'test.priv.asc'), (err, file) => {
        GPG.importKey(file, [], (importErr, result, fingerprint) => {
          expect(result).toMatch(/secret keys read: 1/);
          expect(result).toMatch(/key 833744386F20F59D:/);
          expect(fingerprint).toBe('833744386F20F59D');
          done();
        });
      });
    });

    it('importing a missing file errors', done => {
      GPG.importKeyFromFile(path.join(__dirname, 'test.pub.asc1'), [],(err, result) => {
        expect(err).toBeDefined();
        expect((err as ErrnoException).code).toBe('ENOENT');
        done();
      });
    });

    it('importing a malformed file errors', done => {
      GPG.importKeyFromFile(path.join(__dirname, 'gpg.test.ts'), [], (err, result) => {
        expect(err).toBeDefined();
        expect(err.message).toMatch(/no valid OpenPGP data found/);
        done();
      });
    });
  });

  describe('encrypt', () => {
    it('should encrypt data', done => {
      const mySecret = 'Hello World';
      const args = [
        '--default-key', '6F20F59D',
        '--recipient', '6F20F59D',
        '--armor',
        '--trust-model', 'always' // so we don't get "no assurance this key belongs to the given user"
      ];
      GPG.encrypt(mySecret, args, (err, encrypted) => {
        expect(encrypted.length).toBeDefined();
        encryptedString = encrypted.toString()
        expect(encrypted.toString()).toMatch(/BEGIN PGP MESSAGE/);
        done();
      });
    });

    it('should encrypt stream with callStreaming()', done => {
      const args = [
        '--encrypt',
        '--default-key', '6F20F59D',
        '--recipient', '6F20F59D',
        '--armor',
        '--trust-model', 'always', // so we don't get "no assurance this key belongs to the given user"
      ];

      const inStream = fs.createReadStream(path.join(__dirname, 'hello.txt'));
      const outStream = new Stream.PassThrough();

      GPG.callStreaming(inStream, outStream, args, () => {
        const out: Buffer[] = [];
        outStream.on('data', data => {
          out.push(data);
        });
        outStream.on('end', () => {
          const res = Buffer.concat(out).toString();
          expect(res).toMatch(/BEGIN PGP MESSAGE/);
          done();
        });
        outStream.on('error', error => {
          throw error;
        });
      });
    });

    it('should encrypt stream with encryptStream()', done => {
      const args = [
        '--default-key', '6F20F59D',
        '--recipient', '6F20F59D',
        '--armor',
        '--trust-model', 'always', // so we don't get "no assurance this key belongs to the given user"
      ];

      const inStream = fs.createReadStream('./test/hello.txt');

      GPG.encryptStream(inStream, args, (err, res) => {
        expect(err).toBeNull();
        expect(res.toString("utf-8")).toMatch(/BEGIN PGP MESSAGE/);
        done();
      });
    });
  });

  describe('decrypt', () => {
    it('should decrypt strings', done => {
      GPG.decrypt(encryptedString, [], (err, decrypted) => {
        expect(decrypted.length).toBeDefined();
        expect(decrypted.toString('utf-8')).toBe('Hello World');
        done();
      });
    });

    it('should provide stderr output for successful calls', done => {
      GPG.decrypt(encryptedString, [], (err, decrypted, stderr) => {
        expect(stderr).toMatch(/ID C7365BE1C343C0BC/); // key information is sent to stderr by gpg
        expect(decrypted.toString('utf8')).toBe('Hello World');
        done();
      });
    });

    it('should decrypt Buffers', done => {
      const encryptedBuffer = Buffer.from(encryptedString);
      GPG.decrypt(encryptedBuffer, [], (err, decrypted) => {
        expect(decrypted.length).toBeDefined();
        expect(decrypted.toString('utf-8')).toBe('Hello World');
        done();
      });
    });

    it('should decrypt files', done => {
      GPG.call('', [ '--skip-verify', '--passphrase-fd', '0', '--decrypt', './test/hello.gpg' ], (err, decrypted) => {
        expect(decrypted.length).toBeDefined();
        expect(decrypted.toString('utf-8')).toBe('Hello World\n');
        done();
      });
    });

    it('should decrypt stream with  callStreaming()', done => {
      const args = [
        '--decrypt',
        '--default-key', '6F20F59D',
        '--recipient', '6F20F59D',
        '--trust-model', 'always', // so we don't get "no assurance this key belongs to the given user"
      ];

      const inStream = fs.createReadStream('./test/hello.gpg');
      const outStream = new Stream.PassThrough;

      GPG.callStreaming(inStream, outStream, args, () => {
        const out: Buffer[] = [];
        outStream.on('data', data => {
          out.push(data);
        });
        outStream.on('end', () => {
          const res = Buffer.concat(out).toString();
          expect(res).toMatch(/Hello World/);
          done();
        });
        outStream.on('error', error => {
          throw error;
        });
      });
    });

    it('should decrypt stream with decryptStream()', done => {
      const args = [
        '--default-key', '6F20F59D',
        '--recipient', '6F20F59D',
        '--trust-model', 'always', // so we don't get "no assurance this key belongs to the given user"
      ];
      const inStream = fs.createReadStream('./test/hello.gpg');

      GPG.decryptStream(inStream, args, (err, res) => {
        expect(res.toString("utf-8")).toMatch(/Hello World/);
        done();
      });
    });
  });

  describe('clearsign', () => {
    it('should clearsign data', done => {
      const myMessage = 'Hello, this is me!';
      const args = [
        '--trust-model', 'always'
        , '--default-key', '6F20F59D'
      ];

      GPG.clearsign(myMessage, args, (err, clearsigned) => {
        expect(clearsigned.length).toBeDefined();
        done();
      });
    });
  });

  describe('verifying signature', () => {
    it('should verify signature on data', done => {
      const myMessage = 'Hello, this is me!';
      const args = [
        '--trust-model', 'always'
        , '--default-key', '6F20F59D'
      ];

      GPG.clearsign(myMessage, args, (err, clearsigned) => {
        expect(clearsigned.length).toBeDefined();
        GPG.verifySignature(clearsigned, [], (verifyErr, result) => {
          expect(result.toString("utf-8")).toMatch(/good signature/i);
          done();
        });
      });
    });
  });

  describe('remove keys', () => {
    it('should remove both keys', done => {
      GPG.removeKey('6F20F59D', [], (err, result) => {
        if (err) throw err;
        done();
      });
    });
  });
});
