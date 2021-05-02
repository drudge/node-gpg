import { GpgService } from "../dist";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const spawnGPG = (input, args = []) =>
  Promise.resolve(`gpg --batch ${args.join(" ")} "${input}"`);

describe("call", () => {
  it("uses the right commands", function () {
    const gpg = new GpgService({
      spawnGPG,
    });
    return gpg.call(
      "",
      [
        "--skip-verify",
        "--passphrase-fd",
        "0",
        "--decrypt",
        "./test/hello.gpg",
      ]
    ).then(command => {
        expect(command).to.equal('gpg --batch --skip-verify --passphrase-fd 0 --decrypt ./test/hello.gpg ""');
    });
  });
});
