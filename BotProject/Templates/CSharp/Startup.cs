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

namespace Microsoft.Bot.Builder.TestBot.Json
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

            // Configure storage for deployment
            var cosmosDbStorage = new CosmosDbStorage(settings.CosmosDb);
            services.AddSingleton<IStorage>(cosmosDbStorage);
            var userState = new UserState(cosmosDbStorage);
            var conversationState = new ConversationState(cosmosDbStorage);
            var inspectionState = new InspectionState(cosmosDbStorage);

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
                .UseStorage(cosmosDbStorage)
                .UseState(userState, conversationState)
                .UseLanguageGeneration(resourceExplorer)
                .UseDebugger(4712)
                .Use(new InspectionMiddleware(inspectionState, userState, conversationState, credentials))
                .UseResourceExplorer(resourceExplorer);

                adapter.OnTurnError = async (turnContext, exception) =>
                {
                    await turnContext.SendActivityAsync(exception.Message).ConfigureAwait(false);
                    telemetryClient.TrackException(new Exception("Exceptions: " + exception.Message));
                    await conversationState.ClearStateAsync(turnContext).ConfigureAwait(false);
                    await conversationState.SaveChangesAsync(turnContext).ConfigureAwait(false);
                };
                return adapter;
            });

            services.AddSingleton<IBot, TestBot>((sp) => new TestBot("Main.dialog", conversationState, userState, resourceExplorer, DebugSupport.SourceRegistry, telemetryClient));
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
