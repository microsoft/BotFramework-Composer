// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using BotProject;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public class Program
    {
        public static void Main(string[] args)
        {
            while (true)
            {
                EventWatcher.Clean();
                var watcher = EventWatcher.GetWatcher();
                var host = BuildWebHost(args);

                watcher.Changed += (object sender, FileChangeArgs param) =>
                {
                    host.Dispose();
                    host.StopAsync().GetAwaiter().GetResult();
                };
                // The thread will block in here until a valid event triggered.
                host.Run();
            }
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            var commandLineConfig = new ConfigurationBuilder()
                        .AddCommandLine(args)
                        .Build();
            return WebHost.CreateDefaultBuilder(args)
                    .ConfigureAppConfiguration((hostingContext, config) =>
                    {
                        var env = hostingContext.HostingEnvironment;

                        config.SetBasePath(Directory.GetCurrentDirectory());
                        config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
                        config.AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);
                        config.AddEnvironmentVariables();
                        config.AddCommandLine(args);
                    })
                    .UseConfiguration(commandLineConfig)
                    .UseStartup<Startup>()
                    .Build();
        }

    }
}
