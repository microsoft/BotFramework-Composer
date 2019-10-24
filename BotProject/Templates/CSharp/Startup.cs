// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Declarative.Types;
using Microsoft.Bot.Builder.Integration;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Schema;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Debug;
using System.Diagnostics;
using System.IO;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder.BotFramework;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Azure;
using Microsoft.AspNetCore.Http.Connections.Internal;
using Microsoft.Bot.Builder.ApplicationInsights;
using Microsoft.ApplicationInsights;
using Microsoft.Bot.Builder.Integration.ApplicationInsights.Core;
using Microsoft.Bot.Builder.Dialogs.Adaptive;

namespace Microsoft.Bot.Builder.ComposerBot.json
{
    public class Startup
    {
        public Startup(IHostingEnvironment env, IConfiguration configuration)
        {
            this.HostingEnvironment = env;
            this.Configuration = configuration;
        }

        public IHostingEnvironment HostingEnvironment { get; }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddSingleton<IConfiguration>(this.Configuration);

            // Create the credential provider to be used with the Bot Framework Adapter.
            services.AddSingleton<ICredentialProvider, ConfigurationCredentialProvider>();

            services.AddSingleton<InspectionMiddleware>();

            // Load settings
            var settings = new BotSettings();
            Configuration.Bind(settings);

            IStorage storage = null;

            // Configure storage for deployment
            if (!string.IsNullOrEmpty(settings.CosmosDb.AuthKey))
            {
                storage = new CosmosDbStorage(settings.CosmosDb);
            }
            else
            {
                Console.WriteLine("The settings of CosmosDbStorage is incomplete, please check following settings: settings.CosmosDb");
                storage = new MemoryStorage();
            }

            services.AddSingleton(storage);
            var userState = new UserState(storage);
            var conversationState = new ConversationState(storage);
            var inspectionState = new InspectionState(storage);

            // Configure telemetry
            services.AddApplicationInsightsTelemetry();
            var telemetryClient = new BotTelemetryClient(new TelemetryClient());
            services.AddSingleton<IBotTelemetryClient>(telemetryClient);
            services.AddBotApplicationInsights(telemetryClient);

            var botFile = Configuration.GetSection("bot").Get<string>();

            TypeFactory.Configuration = this.Configuration;

            // manage all bot resources
            var resourceExplorer = new ResourceExplorer().AddFolder(botFile);

            var credentials = new MicrosoftAppCredentials(this.Configuration["MicrosoftAppId"], this.Configuration["MicrosoftAppPassword"]);

            services.AddSingleton<IBotFrameworkHttpAdapter, BotFrameworkHttpAdapter>((s) =>
            {
                var adapter = new BotFrameworkHttpAdapter(new ConfigurationCredentialProvider(this.Configuration));
                adapter
                  .UseStorage(storage)
                  .UseState(userState, conversationState)
                  .UseAdaptiveDialogs()
                  .UseResourceExplorer(resourceExplorer)
                  .UseLanguageGeneration(resourceExplorer, "common.lg")
                  .Use(new RegisterClassMiddleware<IConfiguration>(Configuration))
                  .Use(new InspectionMiddleware(inspectionState, userState, conversationState, credentials));

                if (!string.IsNullOrEmpty(settings.BlobStorage.ConnectionString) && !string.IsNullOrEmpty(settings.BlobStorage.Container))
                {
                    adapter.Use(new TranscriptLoggerMiddleware(new AzureBlobTranscriptStore(settings.BlobStorage.ConnectionString, settings.BlobStorage.Container)));
                }
                else
                {
                    Console.WriteLine("The settings of TranscriptLoggerMiddleware is incomplete, please check following settings: settings.BlobStorage.ConnectionString, settings.BlobStorage.Container");
                }



                adapter.OnTurnError = async (turnContext, exception) =>
                {
                    await turnContext.SendActivityAsync(exception.Message).ConfigureAwait(false);
                    telemetryClient.TrackException(new Exception("Exceptions: " + exception.Message));
                    await conversationState.ClearStateAsync(turnContext).ConfigureAwait(false);
                    await conversationState.SaveChangesAsync(turnContext).ConfigureAwait(false);
                };
                return adapter;
            });

            services.AddSingleton<IBot, ComposerBot>((sp) => new ComposerBot("Main.dialog", conversationState, userState, resourceExplorer, DebugSupport.SourceMap, telemetryClient));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            //app.UseHttpsRedirection();
            app.UseMvc();
        }
    }
}
