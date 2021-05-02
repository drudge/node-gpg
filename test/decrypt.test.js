import { GpgService } from "../dist";
import fs from "fs";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const spawnGPG = (input, args = []) =>
  Promise.resolve(`gpg --batch ${args.join(" ")} "${input}"`);

const encryptedString = `TEST ENCRYPTED STRING`;

describe("decrypt", function () {
  it("should decrypt strings", function () {
    const gpg = new GpgService({
      spawnGPG,
    });
    return gpg
      .decrypt(encryptedString)
      .then((command) =>
        expect(command).to.equal(
          'gpg --batch --decrypt "TEST ENCRYPTED STRING"'
        )
      );
  });

  it("should decrypt stream with decryptStream()", function () {
    const gpg = new GpgService({
      spawnGPG,
    });
    var inStream = fs.createReadStream("./test/hello.gpg");

    gpg
      .decryptStream(inStream, [
        "--default-key",
        "6F20F59D",
        "--recipient",
        "6F20F59D",
        "--trust-model",
        "always", // so we don't get "no assurance this key belongs to the given user"
      ])
      .then((command) => {
        expect(command).to.equal("");
      });
  });
});
