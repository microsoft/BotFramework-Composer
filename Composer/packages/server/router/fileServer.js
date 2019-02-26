var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var config = require('../config.json');

//!Notice: .bot file's path is just a name, its real path depends on config.bot.path of package.json.
//Other file's path are relative path of .bot file.

const botFilePath = config.bot.path;
const botFileDir = path.dirname(botFilePath);
const botFileName = botFilePath.substr(botFilePath.lastIndexOf("/") + 1);

router.get("/", function(req, res, next) {
    let fileList = [];
    try {
        //get .bot file
        let botFileContent = fs.readFileSync(botFilePath, "utf-8");
        fileList.push({name:botFileName, content:botFileContent});

        //get 'files' from .bot file
        let botConfig = JSON.parse(botFileContent);
        if(botConfig != undefined && ('files' in botConfig) && botConfig.files instanceof Array){
            for(let filePath of botConfig.files){
                let realFilePath = path.join(botFileDir, filePath);
                if(fs.lstatSync(realFilePath).isFile()){
                    let content = fs.readFileSync(realFilePath, "utf-8");
                    fileList.push({name:filePath, content:content});
                }
            }
        }
        res.status(200).json(fileList);
    } catch (error) {
        console.log(error);
        res.status(400).json({error: 'get file list error'});
    }
});

router.put("/", function(req, res, next) {
    try {
        let realFilePath = path.join(botFileDir, req.body.name);
        fs.writeFile(realFilePath, req.body.content, {}, function (err) {
            if(err) {
                res.status(400).json({error: 'save error'});
             } else {
                res.send('OK');
             }
         });
    } catch (error) {
        res.status(400).json({error: 'save error'});
    }
});

module.exports = router;