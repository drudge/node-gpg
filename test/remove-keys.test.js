import { GpgService } from "../dist";
import fs from "fs";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const spawnGPG = (input, args = []) =>
  Promise.resolve(`gpg --batch ${args.join(" ")} "${input}"`);

describe("remove keys", () => {
  it("should remove both keys", function () {
    const gpg = new GpgService({
      spawnGPG,
    });
    return gpg.removeKey("6F20F59D").then((command) => {
      expect(command).to.equal('gpg --batch --logger-fd 1 --delete-secret-and-public-key "6F20F59D"');
    });
  });
});
