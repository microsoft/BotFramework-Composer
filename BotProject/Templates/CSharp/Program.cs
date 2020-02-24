// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Diagnostics;
using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Bot.Builder.AI.Luis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }
      
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration((hostingContext, builder) =>
            {
                builder.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                       .AddJsonFile($"ComposerDialogs/settings/appsettings.json", optional: true, reloadOnChange: true)
                       .UseLuisSettings();

                var env = hostingContext.HostingEnvironment;
                if (env.IsDevelopment())
                {
                    builder.AddUserSecrets<Startup>();
                }   
                
                builder.AddEnvironmentVariables()
                       .AddCommandLine(args);
            })
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
    }
}
