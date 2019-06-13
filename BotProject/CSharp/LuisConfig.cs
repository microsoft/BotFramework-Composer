using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public class LuisCustomConfig
    {
        public Dictionary<string, string> Luis { get; set; }
    }

    public class LuisKey
    {
        public string Key { get; set; }
    }

    public class LuConfigFile
    {
        public string Name { get; set; }

        public string DefaultLanguage { get; set; }

        public List<string> Models { get; set; }

        public string AuthoringKey { get; set; }

        public bool Dialogs { get; set; }

        public string Environment { get; set; }

        public bool Autodelete { get; set; }

        public string AuthoringRegion { get; set; }

        public string Folder { get; set; }

        public bool Help { get; set; }

        public bool Force { get; set; }

        public string Config { get; set; }

        public string EndpointKeys { get; set; }
    }

}
