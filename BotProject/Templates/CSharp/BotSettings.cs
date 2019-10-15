using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Bot.Builder.Azure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.Bot.Builder.ComposerBot.json
{
    public class BotSettings
    {
        public BotSettings()
        {

        }

        public BlobStorageConfiguration BlobStorage { get; set; }

        public string MicrosoftAppId { get; set; }

        public string MicrosoftAppPassword { get; set; }

        public CosmosDbStorageOptions CosmosDb { get; set; }

        public TelemetryConfiguration AppInsights { get; set; }

        public class BlobStorageConfiguration
        {
            public BlobStorageConfiguration()
            {

            }

            public string ConnectionString { get; set; }
            public string Container { get; set; }
        }
    }
}
