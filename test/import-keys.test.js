import { GpgService } from "../dist";
import path from "path";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe("import keys", async function () {
  it("should import the pubkey from file for the remaining tests", function () {
    const gpg = new GpgService({
      spawnGPG: () => Promise.resolve(`gpg: key 6F20F59D:`),
      reader: {
        readFileString: () =>
          Promise.resolve("THIS IS A TEST PUBLIC KEY FILE CONTENT"),
      },
    });
    return gpg
      .importKeyFromFile(path.join(__dirname, "test.pub.asc"))
      .then(({ fingerprint, result }) => {
        expect({ fingerprint, result }).to.deep.equal({
          fingerprint: "6F20F59D",
          result: `gpg: key 6F20F59D:`,
        });
      });
  });

  it("should import the privkey as string for the remaining tests", function () {
    const gpg = new GpgService({
      spawnGPG: () => Promise.resolve(`gpg: key 6F20F59D:`),
    });
    return gpg
      .importKey("THIS IS A TEST PRIVATE KEY FILE CONTENT")
      .then(({ fingerprint }) => {
        expect(fingerprint).to.equal("6F20F59D");
      });
  });

  it("importing a missing file errors", function () {
    const gpg = new GpgService({
      reader: {
        readFileString: () => Promise.reject("ENOENT"),
      },
    });
    return expect(
      gpg.importKeyFromFile(path.join(__dirname, "test.pub.asc1"))
    ).to.eventually.be.rejectedWith("ENOENT");
  });

  it("importing a malformed file errors", function () {
    const gpg = new GpgService({
      spawnGPG: () => Promise.reject(`no valid OpenPGP data found`),
      reader: {
        readFileString: () =>
          Promise.resolve("THIS IS A TEST PUBLIC KEY FILE CONTENT"),
      },
    });
    return expect(
      gpg.importKeyFromFile(path.join(__dirname, "index.test.js"))
    ).to.eventually.be.rejectedWith(/no valid OpenPGP data found/);
  });
});
