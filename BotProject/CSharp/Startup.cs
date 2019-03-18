﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Bot.Builder.AI.LanguageGeneration;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Composition.Resources;
using Microsoft.Bot.Builder.Dialogs.Flow.Loader.Types;
using Microsoft.Bot.Builder.Integration;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Builder.TestBot.Json.Recognizers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            HostingEnvironment = env;
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();

            RegisterTypes();
        }
        public IHostingEnvironment HostingEnvironment { get; }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            IStorage dataStore = new MemoryStorage();
            var conversationState = new ConversationState(dataStore);
            var userState = new UserState(dataStore);
            var userStateMap = userState.CreateProperty<StateMap>("user");

            // Get Bot file
            string rootDialog = string.Empty;
            var botFile = Configuration.GetSection("bot").Get<BotFile>();
            var botProject = BotProject.Load(botFile);
            rootDialog = botProject.entry;
           
            var accessors = new TestBotAccessors
            {
                ConversationDialogState = conversationState.CreateProperty<DialogState>("DialogState"),
                ConversationState = conversationState,
                UserState = userState,
			    RootDialogFile = botProject.path + rootDialog
            };

            services.AddBot<IBot>(
                (IServiceProvider sp) =>
                {
                    return new TestBot(accessors);
                },
                (BotFrameworkOptions options) =>
                {
                    options.OnTurnError = async (turnContext, exception) =>
                    {
                        await conversationState.ClearStateAsync(turnContext);
                        await conversationState.SaveChangesAsync(turnContext);
                    };

                    //manage all bot resources
                    var botResourceManager = new BotResourceManager()
                        // add current folder, it's project file, packages, projects, etc.
                        .AddProjectResources(HostingEnvironment.ContentRootPath)
                        .AddFolderResources(botProject.path);

                    // create LG 
                    var lg = new LGLanguageGenerator(botResourceManager);
                    options.Middleware.Add(new RegisterClassMiddleware<IBotResourceProvider>(botResourceManager));
                    options.Middleware.Add(new RegisterClassMiddleware<ILanguageGenerator>(lg));
                    options.Middleware.Add(new RegisterClassMiddleware<IMessageActivityGenerator>(new TextMessageActivityGenerator(lg)));
                    options.Middleware.Add(new AutoSaveStateMiddleware(conversationState));
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles()
                .UseStaticFiles()
                .UseBotFramework();
            app.UseExceptionHandler();
        }

        private void RegisterTypes()
        {
            Factory.Register("Microsoft.RuleRecognizer", typeof(RuleRecognizer));
        }
    }
}
