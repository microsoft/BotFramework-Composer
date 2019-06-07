using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public class BotProject
    {
        [JsonProperty("entry")]
        public string entry { get; set; }
        public List<string> Folders{ get; set; }

        public static async Task<BotProject> LoadAsync(string file)
        {
            string json = string.Empty;
            using (var stream = File.OpenText(file))
            {
                json = await stream.ReadToEndAsync().ConfigureAwait(false);
            }
            var currentFolder = Path.GetFullPath(Path.GetDirectoryName(file));          
            var bot = JsonConvert.DeserializeObject<BotProject>(json);
            bot.Folders = new List<string>();
            bot.Folders.Add(currentFolder);

            return bot;
        }

        public static BotProject Load(string file)
        {
            return BotProject.LoadAsync(file).GetAwaiter().GetResult();
        }
    }
}
