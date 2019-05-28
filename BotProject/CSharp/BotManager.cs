using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Builder.LanguageGeneration.Renderer;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public interface IBotManager
    { 
        IBotFrameworkHttpAdapter CurrentAdapter { get; }
        IBot CurrentBot { get;  }

        void SetCurrent(Stream fileStream);
    }

    public class BotManager : IBotManager
    {
        public BotManager(IConfiguration config)
        {
            Config = config;

            // init work dir
            WorkDir = ConvertPath("tmp");
            EnsureDirExists(WorkDir);
            CleanDir(WorkDir);

            // set init bot
            var bot = Config.GetSection("bot").Get<string>();
            var botProj = BotProject.Load(bot);
            SetCurrent(botProj);
        }

        public IConfiguration Config { get; }

        public IBotFrameworkHttpAdapter CurrentAdapter { get; set; }

        public IBot CurrentBot { get; set; }

        private string WorkDir { get; }

        private static readonly object locker = new object();

        public void SetCurrent(BotProject botProject)
        {
            IStorage storage = new MemoryStorage();
            var userState = new UserState(storage);
            var conversationState = new ConversationState(storage);
            var rootDialog = botProject.entry;

            // manage all bot resources
            var resourceExplorer = new ResourceExplorer();
            foreach (var folder in botProject.Folders)
            {
                resourceExplorer.AddFolder(folder);
            }

            var adapter = new BotFrameworkHttpAdapter();

            adapter
                .UseStorage(storage)
                .UseState(userState, conversationState)
                .UseLanguageGenerator(new LGLanguageGenerator(resourceExplorer))
                .UseDebugger(4712)
                .UseResourceExplorer(resourceExplorer);
            adapter.OnTurnError = async (turnContext, exception) =>
            {
                await turnContext.SendActivityAsync(exception.Message).ConfigureAwait(false);

                await conversationState.ClearStateAsync(turnContext).ConfigureAwait(false);
                await conversationState.SaveChangesAsync(turnContext).ConfigureAwait(false);
            };
            CurrentAdapter = adapter;

            CurrentBot = new TestBot(rootDialog, conversationState, resourceExplorer, DebugSupport.SourceRegistry);
        }

        public void SetCurrent(Stream fileStream)
        {
            lock (locker)
            {
                // download file as tmp.zip
                var downloadPath = SaveFile(fileStream, "tmp.zip").GetAwaiter().GetResult();

                // extract to bot folder
                var extractPath = ExtractFile(downloadPath, GenNewBotDir());

                // locate the proj file
                var projFile = FindBotProjFile(extractPath);

                var botProj = BotProject.Load(projFile);
                SetCurrent(botProj);
            }
        }

        private string GenNewBotDir()
        {
            return System.Guid.NewGuid().ToString("N");
        }

        private async Task<string> SaveFile(Stream fileStream, string fileName)
        {
            EnsureDirExists(WorkDir);

            var filePath = Path.Combine(WorkDir, fileName);
            using (var outStream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(outStream);
            }
            return filePath;
        }

        // Extract file to a dir
        private string ExtractFile(string filePath, string dstDirPath)
        {
            EnsureDirExists(WorkDir);

            var finalDstPath = Path.Combine(WorkDir, dstDirPath);

            ZipFile.ExtractToDirectory(filePath, finalDstPath);
            return finalDstPath;
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


        public static string ConvertPath(string relativePath)
        {
            var curDir = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            return Path.Combine(curDir, relativePath);
        }

        public static void EnsureDirExists(string dirPath)
        {
            var dirInfo = new DirectoryInfo(dirPath);
            if (!dirInfo.Exists)
            {
                dirInfo.Create();
            }
        }

        public static void CleanDir(string dirPath)
        {
            var dir = new DirectoryInfo(dirPath);
            dir.GetFiles().ToList().ForEach(f => f.Delete());
            dir.GetDirectories().ToList().ForEach(d => d.Delete(true));
        }
    }
}