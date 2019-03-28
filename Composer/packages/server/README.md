# Server
API server for composer app

## API spec

### FileSystem API
FileSystem api allows you to management multiple storages and perform file-based on top of them.  


#### storage

`storage` is a top-level resource which follows the common pattern of a REST api. 

`GET api/storages` list storages

by default return 
```
{
    id: "default"
    name: "This pc",
    type: "LocalDrive",
    path: "storage absolute path"
}
```

`POST api/storages` create storage

```
{
    name: "MyStorage"
    type: "AzureBlob",
    url: "http://xxx.blob.net",
    container: "/bots",
    key: "******"
}
```

`DELETE api/storages` delete storage


#### blob
blobs is a sub-resouce of storage, but it's not refered by ID, it's refer by path, because we are building a unified file api interface, not targeting a specific clound storage (which always have id for any item).  

`GET api/storages/{storageId}/blobs/{path}` list dir or get file

this `path` is an absolute path for now

Sample 
```
GET api/storage/default/c:/bots

{
    name: "bots",
    parent: "c:/",
    children: 
    {
        {
            name: "config",
            type:"folder",
            path: "absolute path",
        },
        {
            name: "a.png",
            type:"file",
            path: "absolute path",
            lastModified: 201231290, // ms since epoch
            size: 20kb
        }
    }
}

GET api/storage/default/c:/bots/a.bot 

{
   entry: "main.dialog"
   ……
}


```

### ProjectManagement API

ProjectManagement api allows you to controlled current project status. open\close project, get project related resources etc. 

`GET api/projects/opened`

check if there is a opened projects, return path and storage if any, sample response
``` 
{
    storageId: "default"
    path: "C:/bots/bot1.bot"
}
```

`PUT api/projects/opened`

open a bot project, request body path must be a absolute path of .bot or .botproj file

```
request body
{
    storageId: "default"
    path: "C:/bots/bot1.bot"
}


```

`GET api/projects/opened/files`

resolved all files inside this project

sample
```
response:
[
    {
        name: "",
        content:""
    },
    {
        name:"",
        content:""
    }
]
```