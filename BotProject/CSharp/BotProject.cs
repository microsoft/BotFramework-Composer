﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public class BotFile
    {
        public string provider { get; set; }
        public string path { get; set; }
    }

    public class BotProject
    {
        [JsonProperty("files")]
        public List<string> Files { get; set; }
        [JsonProperty("entry")]
        public string entry { get; set; }
        public List<string> Folders{ get; set; }

        public static async Task<BotProject> LoadAsync(BotFile botFile)
        {
            string file = string.Empty;
            if (botFile.provider == "localDisk")
            {
                file = botFile.path;
            }
            if (string.IsNullOrEmpty(file))
            {
                throw new ArgumentNullException(nameof(file));
            }
            string json = string.Empty;
            using (var stream = File.OpenText(file))
            {
                json = await stream.ReadToEndAsync().ConfigureAwait(false);
            }
            var currentFolder = Path.GetFullPath(Path.GetDirectoryName(botFile.path));          
            var bot = JsonConvert.DeserializeObject<BotProject>(json);
            bot.Folders = new List<string>();
            bot.Folders.Add(currentFolder);

            foreach(string f in bot.Files)
            {
                var folder = Path.GetFullPath(Path.GetDirectoryName(Path.Combine(currentFolder, f)));
                if (Directory.Exists(folder) && !bot.Folders.Contains(folder))
                {
                    bot.Folders.Add(folder);
                }
            }

            return bot;
        }

        public static BotProject Load(BotFile file)
        {
            return BotProject.LoadAsync(file).GetAwaiter().GetResult();
        }
    }
}
