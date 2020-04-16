// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Bot.Builder.Azure;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class BotSettings
    {
        public BotFeatureSettings Feature { get; set; }

        public BlobStorageConfiguration BlobStorage { get; set; }

        public string MicrosoftAppId { get; set; }

        public string MicrosoftAppPassword { get; set; }

        public CosmosDbPartitionedStorageOptions CosmosDb { get; set; }

        public TelemetryConfiguration ApplicationInsights { get; set; }

        public string Bot { get; set; }
    }
}
