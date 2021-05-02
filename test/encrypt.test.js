import { GpgService } from "../dist";
import fs from "fs";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const spawnGPG = (input, args = []) =>
  Promise.resolve(`gpg --batch ${args.join(" ")} "${input}"`);

describe("encrypt", function () {
  it("should encrypt data", function () {
    const gpg = new GpgService({
      spawnGPG,
    });
    return gpg
      .encrypt("Hello World", [
        "--default-key",
        "6F20F59D",
        "--recipient",
        "6F20F59D",
        "--armor",
        "--trust-model",
        "always", // so we don't get "no assurance this key belongs to the given user"
      ])
      .then((command) => {
        expect(command).to.equal('gpg --batch --default-key 6F20F59D --recipient 6F20F59D --armor --trust-model always --encrypt "Hello World"');
      });
  });

  it("should encrypt stream with encryptStream()", function () {
    const gpg = new GpgService({
      spawnGPG,
    });

    var inStream = fs.createReadStream("./test/hello.txt");

    return gpg.encryptStream(inStream, [
      "--default-key",
      "6F20F59D",
      "--recipient",
      "6F20F59D",
      "--armor",
      "--trust-model",
      "always", // so we don't get "no assurance this key belongs to the given user"
    ])
    .then(command => {
      expect(command).to.equal('gpg --batch --default-key 6F20F59D --recipient 6F20F59D --armor --trust-model always --encrypt "Hello World"');
    });
  });
});
