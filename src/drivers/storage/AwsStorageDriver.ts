import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Metaplex } from "@/Metaplex";
import { StorageDriver } from "./StorageDriver";
import { MetaplexFile } from "../filesystem/MetaplexFile";
import BN from "bn.js";

export const awsStorage = (client: S3Client, bucketName: string) => 
  (metaplex: Metaplex) => new AwsStorageDriver(metaplex, client, bucketName);

export class AwsStorageDriver extends StorageDriver {
  protected client: S3Client;
  protected bucketName: string;

  constructor(metaplex: Metaplex, client: S3Client, bucketName: string) {
    super(metaplex);
    this.client = client;
    this.bucketName = bucketName;
  }

  public async getPrice(_file: MetaplexFile): Promise<BN> {
    return new BN(0);
  }

  public async upload(file: MetaplexFile): Promise<string> {
    // TODO: Get from MetaplexFile (Default to random string).
    const key = 'some-key';
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.toBuffer(),
    });

    try {
      const data = await this.client.send(command);
      console.log("Success", data);
      return this.getUrl(key);
    } catch (err) {
      // TODO: Custom errors.
      throw err;
    }
  }

  protected async getUrl(key: string) {
    const region = await this.client.config.region();
    const encodedKey = encodeURIComponent(key);

    return `https://s3.${region}.amazonaws.com/${this.bucketName}/${encodedKey}`;
  }
}