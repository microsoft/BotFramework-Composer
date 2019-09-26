using Microsoft.Bot.Builder.BotFramework;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Bot.Builder.LanguageGeneration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
        IBot CurrentBot { get; }

        void SetCurrent(Stream fileStream, string endpointKey = null, string appPwd = null);
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
            SetCurrent(bot);
        }

        public IConfiguration Config { get; }

        public IBotFrameworkHttpAdapter CurrentAdapter { get; set; }

        public IBot CurrentBot { get; set; }

        private string WorkDir { get; }

        private static readonly object locker = new object();

        public void SetCurrent(string botDir)
        {
            IStorage storage = new MemoryStorage();
            var userState = new UserState(storage);
            var conversationState = new ConversationState(storage);
            var inspectionState = new InspectionState(storage);

            // manage all bot resources
            var resourceExplorer = new ResourceExplorer().AddFolder(botDir);

            var adapter = new BotFrameworkHttpAdapter(new ConfigurationCredentialProvider(Config));

            var credentials = new MicrosoftAppCredentials(Config["MicrosoftAppId"], Config["MicrosoftAppPassword"]);

            adapter
              .UseStorage(storage)
              .UseState(userState, conversationState)
              .UseAdaptiveDialogs()
              .UseResourceExplorer(resourceExplorer)
              .UseLanguageGeneration(resourceExplorer, "common.lg")
              .Use(new RegisterClassMiddleware<IConfiguration>(Config))
              .Use(new InspectionMiddleware(inspectionState, userState, conversationState, credentials));
              
            adapter.OnTurnError = async (turnContext, exception) =>
            {
                await turnContext.SendActivityAsync(exception.Message).ConfigureAwait(false);

                await conversationState.ClearStateAsync(turnContext).ConfigureAwait(false);
                await conversationState.SaveChangesAsync(turnContext).ConfigureAwait(false);
            };
            CurrentAdapter = adapter;

            CurrentBot = new TestBot("Main.dialog", conversationState, userState, resourceExplorer, DebugSupport.SourceMap);
        }

        public void SetCurrent(Stream fileStream, string endpointKey = null, string appPwd = null)
        {
            lock (locker)
            {
                // download file as tmp.zip
                var downloadPath = SaveFile(fileStream, "tmp.zip").GetAwaiter().GetResult();

                // extract to bot folder
                var extractPath = ExtractFile(downloadPath, GenNewBotDir());

                RetrieveSettingsFile(extractPath, endpointKey, appPwd);
                SetCurrent(extractPath);
            }
        }

        public void RetrieveSettingsFile(string extractPath, string endpointKey, string appPwd)
        {
            var settingsPaths = Directory.GetFiles(extractPath, "appsettings.json", SearchOption.AllDirectories);
            if (settingsPaths.Length == 0)
            {
                return;
            }

            var settingsPath = settingsPaths.FirstOrDefault();

            var settings = JsonConvert.DeserializeObject<Dictionary<string, object>>(File.ReadAllText(settingsPath));

            foreach (var pair in settings)
            {
                if (pair.Value is JObject)
                {
                    foreach (var token in pair.Value as JObject)
                    {
                        string subkey = token.Key;
                        JToken subvalue = token.Value;
                        this.Config[$"{pair.Key}:{subkey}"] = subvalue.Value<string>();
                    }
                }
                else
                {
                    this.Config[pair.Key.ToString()] = pair.Value.ToString();
                }
            }

            if (!String.IsNullOrEmpty(endpointKey))
            {
                var luconfigFile = JsonConvert.DeserializeObject<LuConfigFile>(settings["luis"].ToString());
                AddLuisConfig(extractPath, luconfigFile, endpointKey);
            }

            if (!String.IsNullOrEmpty(appPwd))
            {
                AddOAuthConfig(appPwd);
            }
        }

        public void AddLuisConfig(string extractPath, LuConfigFile luconfigFile, string endpointKey)
        {
            var settingsName = $"luis.settings.{luconfigFile.Environment}.{ luconfigFile.AuthoringRegion}.json";
            var luisEndpoint = $"https://{luconfigFile.AuthoringRegion}.api.cognitive.microsoft.com";
            this.Config["luis:endpoint"] = luisEndpoint;

            // No luis settings
            var luisPaths = Directory.GetFiles(extractPath, settingsName, SearchOption.AllDirectories);
            if (luisPaths.Length == 0)
            {
                return;
            }

            var luisPath = luisPaths[0];

            var luisConfig = JsonConvert.DeserializeObject<LuisCustomConfig>(File.ReadAllText(luisPath));

            luisConfig.Luis.Add("endpointKey", endpointKey);

            foreach (var item in luisConfig.Luis)
            {
                this.Config[$"luis:{item.Key}"] = item.Value;
            }
        }

        private void AddOAuthConfig(string appPwd)
        {
            if (string.IsNullOrEmpty(appPwd))
            {
                this.Config["MicrosoftAppPassword"] = string.Empty;
            }
            else
            {
                this.Config["MicrosoftAppPassword"] = appPwd;
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