using Microsoft.BotFramework.Composer.Intermediator;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using Underscore.Bot.MessageRouting;

namespace Microsoft.BotFramework.Composer.CustomAction
{
    public static class Configuration
    {
        public static IConfiguration Settings { get; set; }
        public static IServiceProvider ServiceProvider { get; set; }
        public static MessageRouter MessageRouter { get; set; }
        public static MessageRouterResultHandler MessageRouterResultHandler { get; set; }
        public static ILoggerFactory LoggerFactory { get; set; }
    }
}
