/*!
 * node-gpg
 * Copyright(c) 2011 Nicholas Penree <drudge@conceited.net>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import fs from "fs";
import { Stream } from "node:stream";
import { IStreamingOptions, spawnGPG, streaming } from "./spawnGPG";
const keyRegex = /^gpg: key (.*?):/;

type SpawnGpgFn = (
  input: string,
  args: string[],
  executable: string
) => Promise<Buffer>;
type StreamingFn = (
  options: IStreamingOptions,
  args: string[],
  executable: string
) => Promise<fs.WriteStream>;

export class GpgService {
  constructor(
    private options: {
      spawnGPG?: SpawnGpgFn;
      streaming?: StreamingFn;
      executable?: string;
      reader?: {
        readFile: (filePath: string) => Promise<Buffer>;
        readFileString: (filePath: string) => Promise<string>;
      }
    }
  ) {}

  /**
   * Raw call to gpg.
   */
  call(input: string, args: string[]): Promise<Buffer> {
    return this.options.spawnGPG(input, args, this.options.executable);
  }

  /**
   * Raw streaming call to gpg. Reads from input file and writes to output file.
   *
   * @api public
   */
  callStreaming(
    options: IStreamingOptions,
    args: string[]
  ): Promise<fs.WriteStream> {
    return this.options.streaming(options, args, this.options.executable);
  }

  /**
   * Encrypt source file passed as `options.source` and store it in a file specified in `options.dest`.
   *
   * @api public
   */
  encryptToFile(options: IStreamingOptions): Promise<fs.WriteStream> {
    return this.callStreaming(options, ["--encrypt"]);
  }

  /**
   * Encrypt source `file` and pass the encrypted contents to the callback `fn`.
   *
   * @param {String}   file   Filename.
   * @param {Function} [fn]   Callback containing the encrypted file contents.
   * @api public
   */
  encryptFile(file: string): Promise<Buffer> {
    return this.options.reader.readFile(file).then((content) => this.encrypt(content));
  }

  /**
   * Encrypt source stream passed as `options.source` and pass it to the stream specified in `options.dest`.
   * Is basicaly the same method as `encryptToFile()`.
   *
   * @api public
   */
  encryptToStream(options: IStreamingOptions): Promise<fs.WriteStream> {
    return this.callStreaming(options, ["--encrypt"]);
  }

  /**
   * Encrypt source `stream` and pass the encrypted contents to the callback `fn`.
   *
   * @api public
   */
  encryptStream(stream: Stream, args: string[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks = [];

      stream.on("data", function (chunk) {
        chunks.push(chunk);
      });

      stream.on("end", () => {
        resolve(this.encrypt(Buffer.concat(chunks), args));
      });

      stream.on("error", reject);
    });
  }

  /**
   * Encrypt `str` and pass the encrypted version to the callback `fn`.
   *
   * @api public
   */
  encrypt(str: string | Buffer, args: string[] = []): Promise<Buffer> {
    return this.call(str.toString(), args.concat(["--encrypt"]));
  }

  /**
   * Decrypt `str` and pass the decrypted version to the callback `fn`.
   *
   * @api public
   */
  decrypt(str: string | Buffer, args: string[] = []): Promise<Buffer> {
    return this.call(str.toString(), args.concat(["--decrypt"]));
  }

  /**
   * Decrypt source `file` and pass the decrypted contents to the callback `fn`.
   *
   * @api public
   */
  decryptFile(file: string): Promise<Buffer> {
    return this.options.reader.readFile(file).then((content) => this.decrypt(content));
  }

  /**
   * Decrypt source file passed as `options.source` and store it in a file specified in `options.dest`.
   *
   * @api public
   */
  decryptToFile(options: IStreamingOptions): Promise<fs.WriteStream> {
    return this.callStreaming(options, ["--decrypt"]);
  }

  /**
   * Decrypt source `stream` and pass the decrypted contents to the callback `fn`.
   *
   * @api public
   */
  decryptStream(stream: Stream, args: string[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks = [];

      stream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      stream.on("end", () => {
        resolve(this.decrypt(Buffer.concat(chunks), args));
      });

      stream.on("error", reject);
    });
  }

  /**
   * Decrypt source stream passed as `options.source` and pass it to the stream specified in `options.dest`.
   * This is basicaly the same method as `decryptToFile()`.
   *
   * @api public
   */
  decryptToStream(options: IStreamingOptions): Promise<fs.WriteStream> {
    return this.callStreaming(options, ["--decrypt"]);
  }

  /**
   * Clearsign `str` and pass the signed message to the callback `fn`.
   *
   * @api public
   */
  clearsign(str: string | Buffer, args: string[] = []): Promise<Buffer> {
    return this.call(str as string, args.concat(["--clearsign"]));
  }

  /**
   * Verify `str` and pass the output to the callback `fn`.
   *
   * @api public
   */
  verifySignature(str: string | Buffer, args: string[] = []): Promise<Buffer> {
    // Set logger fd, verify otherwise outputs to stderr for whatever reason
    return this.call(
      str as string,
      args.concat(["--logger-fd", "1", "--verify"])
    );
  }

  /**
   * Add a key to the keychain by filename.
   *
   * @api public
   */
  importKeyFromFile(
    fileName: string,
    args: string[] = []
  ): Promise<{ fingerprint: string; result: string }> {
    return this.options.reader
      .readFileString(fileName)
      .then((str) => this.importKey(str, args));
  }

  /**
   * Add an ascii-armored key to gpg. Expects the key to be passed as input.
   *
   * @param {String}   keyStr  Key string (armored).
   * @param {Array}    args    Optional additional arguments to pass to gpg.
   * @param {Function} fn      Callback containing the signed message Buffer.
   * @api public
   */
  importKey(
    keyStr: string,
    args: string[] = []
  ): Promise<{ fingerprint: string; result: string }> {
    return this.call(keyStr, args.concat(["--logger-fd", "1", "--import"]))
      .then((result) => {
        // Grab key fingerprint and send it back as second arg
        const match = result.toString().match(keyRegex);
        return { fingerprint: match && match[1], result: result.toString() };
      })
      .catch((importError) => {
        // Ignorable errors
        if (/already in secret keyring/.test(importError.message)) {
          throw new Error(importError.message);
        } else {
          throw new Error(importError);
        }
      });
  }

  /**
   * Removes a key by fingerprint. Warning: this will remove both pub and privkeys!
   *
   * @param {String}   keyID  Key fingerprint.
   * @param {Array}    [args] Array of additonal gpg arguments.
   * @param {Function} fn     Callback containing the signed message Buffer.
   * @api public
   */
  removeKey(keyID: string, args: string[] = []): Promise<Buffer> {
    // Set logger fd, verify otherwise outputs to stderr for whatever reason
    return this.call(
      keyID,
      args.concat(["--logger-fd", "1", "--delete-secret-and-public-key"])
    );
  }
}

export const gpg = new GpgService({
  spawnGPG,
  streaming,
  reader: {
    readFile: fs.promises.readFile,
    readFileString: filePath => fs.promises.readFile(filePath, "utf8")
  }
});
export default gpg;
