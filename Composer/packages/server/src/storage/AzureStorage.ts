import azure, { BlobService } from 'azure-storage';

export class AzureStorage {
  public _blobService: BlobService;
  private account: string;
  private key: string;
  constructor(account: string, key: string) {
    this.account = account;
    this.key = key;
    this._blobService = azure.createBlobService(this.account, this.key);
  }
  public async listContainers(): Promise<BlobService.ContainerResult[] | Error> {
    return new Promise((resolve, reject) => {
      this._blobService.listContainersSegmented(null as any, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.entries);
        }
      });
    });
  }

  public async listBlobs(containerName: string): Promise<BlobService.BlobResult[] | Error> {
    return new Promise((resolve, reject) => {
      this._blobService.listBlobsSegmented(containerName, null as any, (err, data) => {
        if (err) {
          reject(err);
        } else {
          console.log({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
          resolve(data.entries);
        }
      });
    });
  }
  // addAzureStorage: (body: any) => {
  //   if (body.path) {

  //   }
  // },
  // get current layer files list
}
