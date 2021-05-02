import { GpgService } from "../dist";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const streaming = (input, args = []) =>
  Promise.resolve(`gpg --batch ${args.join(" ")} "${input}"`);

describe("callStreaming", () => {
  it("uses the right commands", function () {
    const gpg = new GpgService({
      streaming,
    });
    return gpg
      .callStreaming(
        {
          source: "source",
          dest: "dest",
        },
        [
          "--decrypt",
          "--default-key",
          "6F20F59D",
          "--recipient",
          "6F20F59D",
          "--trust-model",
          "always", // so we don't get "no assurance this key belongs to the given user"
        ]
      )
      .then((command) => {
        expect(command).to.equal('gpg --batch --decrypt --default-key 6F20F59D --recipient 6F20F59D --trust-model always "[object Object]"');
      });
  });
});
