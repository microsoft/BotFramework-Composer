import { StorageConnection } from '../../../src/models/storage/interface';
import { AzureBlobStorage } from '../../../src/models/storage/azureBlobStorage';

jest.mock('azure-storage', () => {
  return {
    createBlobService: (_account: string, _key: string) => {
      return {
        listContainersSegmented: (token: any, _callback: Function) => {
          return _callback(null, {
            entries: [{ name: 'containerName1' }, { name: 'containerName2' }],
          });
        },
        doesBlobExist: (_container: string, _prefix: string, callback: Function) => {
          return callback(null, {
            lastModified: 'testTime',
            contentLength: 'testSize',
            exists: true,
          });
        },
        listBlobDirectoriesSegmentedWithPrefix: (
          _container: string,
          _prefix: string,
          token: null,
          callback: Function
        ) => {
          return callback(null, {
            entries: [{ name: 'dir1' }, { name: 'dir2' }],
          });
        },
        getBlobToText: (_container: string, blobPath: string, callback: Function) => {
          return callback(null, 'file content');
        },
        listBlobsSegmentedWithPrefix: (_container: string, _prefix: string, token: string, callback: Function) => {
          return callback(null, {
            entries: [{ name: 'blob1' }, { name: 'blob2' }],
          });
        },
        createBlockBlobFromText: () => {
          return;
        },
        deleteBlob: (_container: string, path: string, callback: Function) => {
          return callback(null);
        },
        createContainerIfNotExists: (container: string, callback: Function) => {
          return callback(null);
        },
      };
    },
  };
});

const mockStorageConnect = {
  id: 'testAzure',
  name: 'Azure Blob Storage',
  type: 'AzureBlobStorage',
  path: '/',
  account: 'test',
  key: 'test',
} as StorageConnection;

describe('test Azure Blob Storage', () => {
  it('test stat function', async () => {
    const client = new AzureBlobStorage(mockStorageConnect);
    let result = await client.stat('/containerName');
    expect(result).toBeDefined();
    expect(result.lastModified).toBe('');
    expect(result.size).toBe('');
    expect(result.isFile).toBe(false);

    result = await client.stat('/containerName/blobName');
    expect(result.lastModified).toBe('testTime');
    expect(result.size).toBe('testSize');
    expect(result.isFile).toBe(true);
  });

  it('test readFile function', async () => {
    const client = new AzureBlobStorage(mockStorageConnect);
    const result = await client.readFile('/container/file');
    expect(result).toBe('file content');
  });

  it('test file exists function', async () => {
    const client = new AzureBlobStorage(mockStorageConnect);
    let result = await client.exists('/container');
    expect(result).toBe(false);
    result = await client.exists('/container/blobname');
    expect(result).toBeTruthy();
  });
  it('test writeFile function', async () => {
    const client = new AzureBlobStorage(mockStorageConnect);
    await expect(client.writeFile('/container', 'content')).rejects.toThrow(
      'path must include container name and blob name'
    );

    await expect(async () => client.writeFile('/container/blobname', 'content')).not.toThrowError();
  });
  it('test removeFile function', async () => {
    const client = new AzureBlobStorage(mockStorageConnect);
    await expect(client.removeFile('/container')).rejects.toThrow('path must include container name and blob name');
    await expect(client.removeFile('/container/blobName')).resolves.toBeUndefined();
  });
  it('test mkDir function', async () => {
    const client = new AzureBlobStorage(mockStorageConnect);
    await expect(client.mkDir('/')).rejects.toThrow('path must include container name and blob name');
    await expect(client.mkDir('/container')).resolves.toBeUndefined();
  });

  it('test getContainersByPath function', async () => {
    const client = new AzureBlobStorage(mockStorageConnect);
    let result = await client.getContainersByPath('/testContainer');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('testContainer');
    result = await client.getContainersByPath('/');
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('containerName1');
    expect(result[1]).toBe('containerName2');
  });
});
