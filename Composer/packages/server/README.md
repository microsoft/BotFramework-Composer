# Server
API server for composer app

## API spec
This is a mimimal API spec to suppport manage multiple storage providers. 

### storage

`storage` is a top-level resource which follows the common pattern of a REST api. 

`GET /storages` list storages

by default return 
```
{
    id: "default"
    name: "This pc",
}
```

`POST /storages` create storage

```
{
    name: "MyStorage"
    type: "AzureBlob",
    url: "http://xxx.blob.net",
    container: "/bots",
    key: "******"
}
```

`DELETE /storages` delete storage


### blob
blobs is a sub-resouce of storage, but it's not refered by ID, it's refer by path, because we are building a unified file api interface, not targeting a specific clound storage (which always have id for any item).  

`GET /storages/{storageId}/blobs/{path}` list dir or get file

this `path` is an absolute path for now

Sample 
```
GET /storage/default/c:/bots

{
    name: "bots"
    type: "dir",
    parent: "c:/",
    items: [
        {
            name: "config"
            type: "dir",
        }
        {
            name: "a.png"
            type: "file",
            lastModified: 201231290, // ms since epoch
            size: 20kb
        }
    ]
}

GET /storage/default/c:/bots/a.bot 

{
    entry: "main.dialog"
}
```

### project

`GET /projects/opened`

check if there is a opened projects, return path and storage if any, sample response
``` 
{
    storageId: "default"
    path: "C:/bots/bot1.bot"
}
```

`PUT /projects/opened`

open a bot project

`GET /projects/opened/files`

resolved all files inside this project`