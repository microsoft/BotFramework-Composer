using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace Microsoft.BotFramework.Composer.Core
{
    /// <summary>
    /// Bot path adapter, for development environment, use '../../' as the bot path, for deployment and production environment, use 'ComposerDialogs' as bot path
    /// </summary>
    public static class ComposerBotPathAdapter
    {
        public static IConfigurationBuilder UseBotPathAdapter(this IConfigurationBuilder builder, bool isDevelopment = true)
        {
            var configuration = builder.Build();
            var settings = new Dictionary<string, string>();
            if (isDevelopment)
            {
                settings["bot"] = "../../";
            }
            else
            {
                settings["bot"] = "ComposerDialogs";
            }
            builder.AddInMemoryCollection(settings);
            return builder;
        }
    }
}
