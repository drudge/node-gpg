import { GpgService } from "../dist";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const spawnGPG = (input, args = []) =>
  Promise.resolve(`gpg --batch ${args.join(" ")} "${input}"`);

describe("clearsign", () => {
  it("should clearsign data", function () {
    const gpg = new GpgService({
      spawnGPG,
    });
    return gpg
      .clearsign("Hello, this is me!", [
        "--trust-model",
        "always",
        "--default-key",
        "6F20F59D",
      ])
      .then((command) => {
        expect(command).to.equal('gpg --batch --trust-model always --default-key 6F20F59D --clearsign "Hello, this is me!"');
      });
  });
});
