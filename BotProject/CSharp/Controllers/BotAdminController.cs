﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with Bot Builder V4 SDK Template for Visual Studio EchoBot v4.3.0

using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    [Route("api/admin")]
    [ApiController]
    public class BotAdminController : ControllerBase
    {
        private readonly IBotManager BotManager;

        public BotAdminController(IBotManager botManager)
        {
            BotManager = botManager;
        }

        private string ConvertPath(string relativePath)
        {
            var curDir = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            return Path.Combine(curDir, relativePath);
        }

        private void EnsureDirExists(string dirPath)
        {
            var dirInfo = new DirectoryInfo(dirPath);
            if (!dirInfo.Exists)
            {
                dirInfo.Create();
            }
        }


        [HttpPost]
        public async Task<IActionResult> PostAsync(IFormFile file)
        {
            if (file == null)
            {
                return BadRequest();
            }

            // download file as tmp.zip
            var downloadPath = await SaveFile(file, "tmp.zip");

            // extract to bot folder
            var extractPath = ExtractFile(downloadPath, ConvertPath("bot"));

            // locate the proj file
            var projFile = FindBotProjFile(extractPath);

            var botProj = BotProject.Load(projFile);
            BotManager.SetCurrent(botProj);
            return Ok();
        }

        // Download the zip file
        private async Task<string> SaveFile(IFormFile file, string fileName = null)
        {
            var dstDir = ConvertPath("download");
            EnsureDirExists(dstDir);

            var filePath = Path.Combine(dstDir, fileName ?? file.Name);
            using (var outStream = new FileStream(filePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(outStream);
            }
            return filePath;
        }

        // Extract file to a dir
        private string ExtractFile(string filePath, string dstDirPath)
        {
            EnsureDirExists(dstDirPath);
            ZipFile.ExtractToDirectory(filePath, dstDirPath);
            return dstDirPath;
        }
      
        private string FindBotProjFile(string dir)
        {
            string[] projFiles = Directory.GetFiles(dir, "*.botproj");
            if (projFiles.Length != 1)
            {
                throw new Exception("no bot proj file in zip file");
            }
            return projFiles[0];
        }


    }
}
