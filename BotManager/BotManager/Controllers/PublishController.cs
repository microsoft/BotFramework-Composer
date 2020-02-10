using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
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

        private readonly static Dictionary<string, RunningBot> runningBots = new Dictionary<string, RunningBot>();

        public static void StopAllBots()
        {
            foreach (var kv in runningBots)
            {
                kv.Value.process.Kill();
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
            var url = ResetBot(botID, version);

            return new PublishResult()
            {
                jobID = System.Guid.NewGuid().ToString(),
                version = version,
                message = $"Bot started at {url}"
            };
        }


        [HttpGet]
        [Route("[action]")]
        public List<PublishRecord> PublishHistory(string botID)
        {
            var result = new List<PublishRecord>() { };

            var botsDir = GetBotsDir();
            var dirInfo = new DirectoryInfo(botsDir);
            foreach (var subDir in dirInfo.GetDirectories())
            {
                var id = subDir.Name;
                var historyDir = new DirectoryInfo(Path.Combine(subDir.FullName, "history"));

                foreach (var file in historyDir.GetFiles())
                {
                    result.Add(new PublishRecord
                    {
                        botID = id,
                        version = Path.GetFileNameWithoutExtension(file.FullName),
                        lastUpdateTime = file.LastWriteTime.ToUniversalTime().ToString()
                    }) ;
                }

            }

            if (botID != null)
            {
                result = result.FindAll(r => r.botID == botID);
            }

            return result;
        }


        [HttpPost]
        [Route("[action]")]
        public PublishResult Rollback([Required]string botID, [Required]string version)
        {
            if (!VersionExists(botID, version))
            {
                throw new ArgumentException("No such botID or version");
            }

            var url = ResetBot(botID, version);
            return new PublishResult
            {
                version = version,
                message = $"Bot started at {url}"
            };

        }


        [HttpGet]
        [Route("[action]")]
        public IActionResult Status()
        {
            return Ok();
        }

        [HttpPost]
        [Route("[action]")]
        public IActionResult Stop(string botID)
        {
            if (runningBots.TryGetValue(botID, out var runningBot))
            {
                runningBot.process.Kill();
                return Ok();
            }
            return NotFound();
        }

        [HttpPost]
        [Route("[action]")]
        public IActionResult StopAll(string botID)
        {
            StopAllBots();
            return Ok();
        }

        private string GetBotsDir() => Path.Combine(this.baseDir, "hostedBots");
        private string GetBotDir(string botID) => Path.Combine(this.GetBotsDir(), botID);
        private string GetBotAssetsDir(string botID) => Path.Combine(this.GetBotDir(botID), "ComposerDialogs");
        private string GetDownloadDir(string botID) => Path.Combine(this.GetBotDir(botID), "history");
        private string GetDownloadPath(string botID, string version) => Path.Combine(this.GetDownloadDir(botID), $"{version}.zip");

        private bool BotExists(string botID) => Directory.Exists(GetBotDir(botID));
        private bool VersionExists(string botID, string version) => System.IO.File.Exists(GetDownloadPath(botID, version));


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


        private string ResetBot(string botID, string versionID)
        {
            var port = "-1";
            if (runningBots.TryGetValue(botID, out var runningBot))
            {
                StopBot(botID);
                port = runningBot.port; // reuse last port
            }
            else
            {
                port = NextAvailablePort(3979).ToString();
            }
            
            RestoreContent(botID, versionID);
            return StartBot(botID, port);
        }

        private void RestoreContent(string botID, string versionID)
        {
            var botAssetsDir = this.GetBotAssetsDir(botID);

            Empty(new DirectoryInfo(botAssetsDir));
            ZipFile.ExtractToDirectory(this.GetDownloadPath(botID, versionID), botAssetsDir);
        }


        private string StartBot(string botID, string port)
        {
            var botDir = GetBotDir(botID);
            var process = CreateProcess("dotnet", $"bin/Debug/netcoreapp2.1/BotProject.dll --urls=http://localhost:{port}", botDir);
            runningBots[botID] = new RunningBot()
            {
                process = process,
                port = port,
            };
            process.Start();
            

            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            return $"http://localhost:{port}";
        }

        private void StopBot(string botID)
        {
            if (runningBots.TryGetValue(botID, out var bot))
            {
                bot.process.Kill(true);
            }
        }


        private void RunCommand(string cmd, string args, string dir)
        {
            var process = CreateProcess(cmd, args, dir);
            process.EnableRaisingEvents = true;

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


        private int NextAvailablePort(int startingPort)
        {
            IPEndPoint[] endPoints;
            List<int> portArray = new List<int>();

            IPGlobalProperties properties = IPGlobalProperties.GetIPGlobalProperties();

            // getting active connections
            TcpConnectionInformation[] connections = properties.GetActiveTcpConnections();
            portArray.AddRange(from c in connections
                               where c.LocalEndPoint.Port >= startingPort
                               select c.LocalEndPoint.Port);

            // getting active tcp listners
            endPoints = properties.GetActiveTcpListeners();
            portArray.AddRange(from n in endPoints
                               where n.Port >= startingPort
                               select n.Port);

            // getting active udp listeners
            endPoints = properties.GetActiveUdpListeners();
            portArray.AddRange(from n in endPoints
                               where n.Port >= startingPort
                               select n.Port);

            portArray.Sort();

            for (int i = startingPort; i < int.MaxValue; i++)
            {
                if (!portArray.Contains(i))
                {
                    return i;
                }
            }

            return -1;
        }
    }
}
