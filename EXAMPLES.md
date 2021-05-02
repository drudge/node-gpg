## Import Key from File

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  const { fingerprint } = await gpg.importKeyFromFile(
    path.join(__dirname, "public.key")
  );
})();
```

## Import Key from String

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  const { fingerprint } = await gpg.importKey(`THIS IS A SAMPLE PUBLIC KEY`);
})();
```

## Remove Key

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  await gpg.removeKey(`6F20F59D`); // pass the key's id
})();
```

## Verify Signature

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  await gpg.verifySignature("Hello, this is me!", [
    "--trust-model",
    "always",
    "--default-key",
    "6F20F59D",
  ]); // pass the key's id
})();
```

## Encrypt String

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  await gpg.encrypt("Hello World", [
    "--default-key",
    "6F20F59D",
    "--recipient",
    "6F20F59D", // you can pass multiple recipients
    "--armor",
    "--trust-model",
    "always",
  ]);
})();
```

## Encrypt File

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  await gpg.encryptFile("/path/to/file", [
    "--default-key",
    "6F20F59D",
    "--recipient",
    "6F20F59D", // you can pass multiple recipients
    "--armor",
    "--trust-model",
    "always",
  ]);
})();
```

## Decrypt String

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  await gpg.decrypt("SAMPLE-ENCRYPTED-STRING", ["./path/to/key.gpg"]);
})();
```

## Decrypt File

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  await gpg.decryptFile("/path/to/encrypted/file", ["./path/to/key.gpg"]);
})();
```

## Other Operations

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  await gpg.call("<input>", [
    "--skip-verify",
    "--passphrase-fd",
    "0",
    "--decrypt",
    "./path/to/key.gpg",
  ]);
})();
```

```js
import { gpg } from "@mykeels/gpg";

(async () => {
  await gpg.callStreaming(
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
      "always",
    ]
  );
})();
```

## Use a different executable besides "gpg"

```js
import { GpgService, spawnGPG, streaming } from "@mykeels/gpg";

(async () => {
  const gpg = new GpgService({
    spawnGPG,
    streaming,
    executable: "custom-gpg",
  });
  await gpg.call("<input>", [
    "--skip-verify",
    "--passphrase-fd",
    "0",
    "--decrypt",
    "./path/to/key.gpg",
  ]);
})();
```
