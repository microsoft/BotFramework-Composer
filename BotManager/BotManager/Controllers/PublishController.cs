using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection.Emit;
using BotManager.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BotManager.Controllers
{
    [ApiController]
    [Route("/composer/api/v1")]
    public class PublishController : Controller
    {
        private readonly ILogger _logger;
        private readonly string baseDir = Directory.GetCurrentDirectory();

        private readonly static Dictionary<string, Process> runningBots = new Dictionary<string, Process>();

        public static void StopAllBots()
        {
            foreach (var kv in runningBots)
            {
                kv.Value.Kill();
            }
        }


        public PublishController(ILogger<PublishController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        [Route("[action]")]
        public PublishResult Publish([FromForm] PublishRequest publishRequest)
        {
            // TODO: decouple bussiness logic in a sperate layer

            var botID = publishRequest.botID;
            var version = publishRequest.version;

            // Make sure the bot is inited
            InitBot(botID);

            // Save content with that ID
            SaveContent(botID, version, publishRequest.content.OpenReadStream());

            // A new publish is also implemented by a reset
            ResetBot(botID, version);

            return new PublishResult()
            {
                jobID = System.Guid.NewGuid().ToString(),
                version = version,
                message = "Bot started at http://localhost:3979/"
            };
        }


        [HttpGet]
        [Route("[action]")]
        public List<PublishRecord> PublishHistory(string botID)
        {
            return new List<PublishRecord>() { };
        }


        [HttpGet]
        [Route("[action]")]
        public IActionResult Stop(string botID)
        {
            if (runningBots.TryGetValue(botID, out var process))
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
            if (runningBots.TryGetValue(botID, out var process))
            {
                process.Kill(true);
                return Ok();
            }
            return NotFound();
        }

        private string GetBotDir(string botID) => Path.Combine(this.baseDir, "hostedBots", botID);
        private string GetBotAssetsDir(string botID) => Path.Combine(this.GetBotDir(botID), "ComposerDialogs");
        private string GetDownloadDir(string botID) => Path.Combine(this.GetBotDir(botID), "history");
        private string GetDownloadPath(string botID, string versionID) => Path.Combine(this.GetDownloadDir(botID), $"{versionID}.zip");

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

                // Create ComposerDialogs and history folder
                Directory.CreateDirectory(this.GetBotAssetsDir(botID));
                Directory.CreateDirectory(this.GetDownloadDir(botID));

                RunCommand("dotnet", "user-secrets init", botDir);
                RunCommand("dotnet", "build", botDir);
            }
        }


        private void SaveContent(string botID, string versionID, Stream botContent)
        {
            var dstPath = GetDownloadPath(botID, versionID);

            using (var outStream = new FileStream(dstPath, FileMode.Create))
            {
                botContent.CopyToAsync(outStream).GetAwaiter().GetResult();
            }
        }


        private void ResetBot(string botID, string versionID)
        {
            StopBot(botID);
            RestoreContent(botID, versionID);
            StartBot(botID);
        }

        private void RestoreContent(string botID, string versionID)
        {
            var botAssetsDir = this.GetBotAssetsDir(botID);

            Empty(new DirectoryInfo(botAssetsDir));
            ZipFile.ExtractToDirectory(this.GetDownloadPath(botID, versionID), botAssetsDir);
        }


        private void StartBot(string botID)
        {
            var botDir = GetBotDir(botID);
            var process = CreateProcess("dotnet", "bin/Debug/netcoreapp2.1/BotProject.dll --urls=http://localhost:3979", botDir);
            runningBots[botID] = process;
            process.Start();

            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
        }

        private void StopBot(string botID)
        {
            if (runningBots.TryGetValue(botID, out var process))
            {
                process.Kill();
            }
        }



        private void RunCommand(string cmd, string args, string dir)
        {
            var process = CreateProcess(cmd, args, dir);


            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            process.WaitForExit();
        }

        private Process CreateProcess(string cmd, string args, string dir)
        {
            var process = new Process()
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

            process.OutputDataReceived += (sender, args) =>
            {
                if (args.Data != null)
                {
                    _logger.LogInformation(args.Data);
                }
            };
            process.ErrorDataReceived += (sender, args) =>
            {
                if (args.Data != null)
                {
                    _logger.LogInformation(args.Data);
                }
            };

            return process;
        }

        public void Empty(DirectoryInfo directory)
        {
            foreach (FileInfo file in directory.GetFiles()) file.Delete();
            foreach (DirectoryInfo subDirectory in directory.GetDirectories()) subDirectory.Delete(true);
        }
    }
}
