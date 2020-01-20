using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using BotManager.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BotManager.Controllers
{
    [ApiController]
    [Route("/composer/api/v1")]
    public class PublishController : Controller
    {
        private readonly string baseDir = Directory.GetCurrentDirectory();

        private readonly Dictionary<string, Process> runningBots = new Dictionary<string, Process>();

        [HttpPost]
        [Route("[action]")]
        public PublishResult Publish([FromForm] PublishRequest publishRequest)
        {
            var botID = publishRequest.botID;

            InitBot(botID);

            StopBot(botID);

            UpdateBot(botID, publishRequest.content.OpenReadStream());

            StartBot(botID);


            return new PublishResult()
            {
                versionID = "random",
                label = publishRequest.label
            };
        }


        [HttpGet]
        [Route("[action]")]
        public IActionResult Stop(string botID)
        {
            if (this.runningBots.TryGetValue(botID, out var process))
            {
                process.Kill();
                return Ok();
            }
            return NotFound();
        }

        [HttpGet]
        [Route("[action]")]
        public IActionResult StopAll(string botID)
        {
            if (this.runningBots.TryGetValue(botID, out var process))
            {
                process.Kill(true);
                return Ok();
            }
            return NotFound();
        }

        private string GetBotDir(string botID) => Path.Combine(this.baseDir, "hostedBots", botID);

        private void InitBot(string botID)
        {
            var botDir = GetBotDir(botID);
            // Prepare the bot if not exist
            if (!Directory.Exists(botDir))
            {
                // Create bot dir
                Directory.CreateDirectory(botDir);

                // Copy project template in
                var templatePath = Path.Combine(this.baseDir, "Templates", "CSharp.zip");
                ZipFile.ExtractToDirectory(templatePath, botDir);

                // Run 'dotnet user-sceret init'
                RunCommand("dotnet", "user-secrets init", botDir);
            }
        }

        private void UpdateBot(string botID, Stream botContent)
        {
            var botDir = GetBotDir(botID);
            // Save the content in a tmp.zip 
            var tmpDir = Path.Combine(botDir, "__tmp__");
            Directory.CreateDirectory(tmpDir);

            var tmpFilePath = Path.Combine(tmpDir, "tmp.zip");
            using (var outStream = new FileStream(tmpFilePath, FileMode.Create))
            {
                botContent.CopyToAsync(outStream).GetAwaiter().GetResult();
            }

            // Clear up the existing content
            var botAssetDir = Path.Combine(botDir, "ComposerDialogs");
            Directory.CreateDirectory(botAssetDir);
            Empty(new DirectoryInfo(botAssetDir));

            // Extract into composerDialogs dir
            ZipFile.ExtractToDirectory(tmpFilePath, botAssetDir);
        }


        private void StartBot(string botID)
        {
            var botDir = GetBotDir(botID);
            var process = CreateProcess("dotnet", "bin/Debug/netcoreapp2.1/BotProject.dll --urls=http://localhost:3979", botDir);
            this.runningBots[botID] = process;
            process.Start();
        }

        private void StopBot(string botID)
        {
            if (this.runningBots.TryGetValue(botID, out var process))
            {
                process.Kill();
            }
        }



        private void RunCommand(string cmd, string args, string dir)
        {
            var process = CreateProcess(cmd, args, dir);

            process.Start();
            process.WaitForExit();
        }

        private Process CreateProcess(string cmd, string args, string dir)
        {
            return new Process()
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = cmd,
                    Arguments = args,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WorkingDirectory = dir
                }
            };
        }

        public void Empty(DirectoryInfo directory)
        {
            foreach (FileInfo file in directory.GetFiles()) file.Delete();
            foreach (DirectoryInfo subDirectory in directory.GetDirectories()) subDirectory.Delete(true);
        }
    }
}
