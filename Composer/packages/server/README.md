# Server
API server for composer app

## API spec

### FileSystem API
FileSystem api allows you to management multiple storages and perform file-based on top of them.  


#### storage

`storage` is a top-level resource which follows the common pattern of a REST api. 

`GET api/fileserver/storages` list storages

by default return 
```
{
    id: "default"
    name: "This pc",
    type: "LocalDrive",
    path: "storage path"
}
```

`POST api/fileserver/storages` create storage

```
{
    name: "MyStorage"
    type: "AzureBlob",
    url: "http://xxx.blob.net",
    container: "/bots",
    key: "******"
}
```

`DELETE api/fileserver/storages` delete storage


#### blob
blobs is a sub-resouce of storage, but it's not refered by ID, it's refer by path, because we are building a unified file api interface, not targeting a specific clound storage (which always have id for any item).  

`GET api/fileserver/storages/{storageId}/blobs/{path}` list dir or get file

this `path` is an absolute path for now

Sample 
```
GET api/fileserver/storage/default/c:/bots

{
    name: "bots",
    parent: "c:/",
    foolderTree: 
    {
        folders:[
        {
            name: "config",
            parent: "bots",
        }],
        files:[{
            name: "a.png"
            parent: "bots",
            lastModified: 201231290, // ms since epoch
            size: 20kb
        }]
    }
}

GET api/fileserver/storage/default/c:/bots/a.bot 

{
   entry: "main.dialog"
   ……
}


```

### ProjectManagement API

ProjectManagement api allows you to controlled current project status. open\close project, get project related resources etc. 

`GET api/fileserver/projects/opened`

check if there is a opened projects, return path and storage if any, sample response
``` 
{
    storageId: "default"
    path: "C:/bots/bot1.bot"
}
```

`POST api/fileserver/projects/opened`
open a bot project

sample
```
request body:
{
    path: "absolute path"
}

response:
[{
    name: "",
    content:"",
    path:""
  },{
    ……
  }
]
```

`GET api/fileserver/projects/opened/files`

resolved all files inside this project`
