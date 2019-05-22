// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with Bot Builder V4 SDK Template for Visual Studio EchoBot v4.3.0

using BotProject.Managers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    // This ASP Controller is created to handle a request. Dependency Injection will provide the Adapter and IBot
    // implementation at runtime. Multiple different IBot implementations running at different endpoints can be
    // achieved by specifying a more specific type for the bot constructor argument.
    [Route("api/messages")]
    [ApiController]
    public class BotController : ControllerBase
    {
        private readonly IBotManager BotManager;

        public BotController(IBotManager botManager)
        {
            BotManager = botManager;
        }

        [HttpPost]
        public async Task PostAsync()
        {
            // Delegate the processing of the HTTP POST to the adapter.
            // The adapter will invoke the bot.
            await BotManager.Current.Adapter.ProcessAsync(Request, Response, BotManager.Current.Bot);
        }

        [HttpPost]
        public async Task PostAsync(ICollection<IFormFile> files)
        {
            // TODO
            // Get new IBot, and Adapter
            // Then BotManager.Push(new BotInjectItem(IBot, Adapter));
            if (files != null && files.Count > 0)
            {
                // the zip file will be extracted to the folder
                var folder = await HandleFileResource(files.First());
            }
        }


        private async Task<string> HandleFileResource(IFormFile file)
        {
            // TODO should take a folder to place the resource
            var rootDirectory = @"d:\tmp";

            var resultFolder = string.Empty;

            InitRootDirectory(rootDirectory);

            var fileName = file.FileName;
            if (IsZipFile(fileName))
            {
                var zipFilePath = await SaveFormFile(file, rootDirectory);
                var directoryPath = Path.Combine(rootDirectory, fileName.Substring(0, fileName.LastIndexOf('.')));
                resultFolder = ExtractZipFile(zipFilePath, directoryPath);
            }

            return resultFolder;
        }

        private bool IsZipFile(string fileName)
        {
            if(string.IsNullOrWhiteSpace(fileName))
            {
                return false;
            }

            return fileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase);
        }

        private string ExtractZipFile(string zipFilePath, string directoryPath)
        {
            CleanDirectory(directoryPath);
            ZipFile.ExtractToDirectory(zipFilePath, directoryPath);
            CleanFile(zipFilePath);

            return directoryPath;
        }

        private async Task<string> SaveFormFile(IFormFile file, string rootDirectory)
        {
            var filePath = Path.Combine(rootDirectory, file.FileName);
            CleanFile(filePath);

            using (var fileStream = new FileStream(filePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fileStream);
            }

            return filePath;
        }

        private void InitRootDirectory(string rootDirectory)
        {
            var rdInfo = new DirectoryInfo(rootDirectory);
            if (!rdInfo.Exists)
            {
                rdInfo.Create();
            }
        }

        private void CleanDirectory(string directoryPath)
        {
            var di = new DirectoryInfo(directoryPath);
            if (di.Exists)
            {
                di.Delete(true);
            }
        }

        private void CleanFile(string filePath)
        {
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }
    }
}
