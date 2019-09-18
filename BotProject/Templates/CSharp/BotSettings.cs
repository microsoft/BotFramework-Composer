using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Bot.Builder.Azure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public class BotSettings
    {
        public BotSettings()
        {

        }

        public string MicrosoftAppId { get; set; }
        public string MicrosoftAppPassword { get; set; }
        public CosmosDbStorageOptions CosmosDb { get; set; }
        public TelemetryConfiguration AppInsights { get; set; }
    }
}
