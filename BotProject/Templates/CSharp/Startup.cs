// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using Microsoft.ApplicationInsights;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder.ApplicationInsights;
using Microsoft.Bot.Builder.Azure;
using Microsoft.Bot.Builder.BotFramework;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Declarative.Types;
using Microsoft.Bot.Builder.Integration.ApplicationInsights.Core;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Builder.Integration.AspNet.Core.Skills;
using Microsoft.Bot.Builder.Skills;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Microsoft.Bot.Builder.ComposerBot.Json
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

            services.AddSingleton(settings);

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

            // Create the User state. (Used in this bot's Dialog implementation.)
            services.AddSingleton<UserState>();

            // Create the Conversation state. (Used by the Dialog system itself.)
            services.AddSingleton<ConversationState>();

            services.AddSingleton<InspectionState>();

            // Configure telemetry
            services.AddApplicationInsightsTelemetry();
            var telemetryClient = new BotTelemetryClient(new TelemetryClient());
            services.AddSingleton<IBotTelemetryClient>(telemetryClient);
            services.AddBotApplicationInsights(telemetryClient);

            var botFile = Configuration.GetSection("bot").Get<string>();

            TypeFactory.Configuration = this.Configuration;

            // manage all bot resources
            var resourceExplorer = new ResourceExplorer().AddFolder(botFile);
            services.AddSingleton(resourceExplorer);

            var credentials = new MicrosoftAppCredentials(this.Configuration["MicrosoftAppId"], this.Configuration["MicrosoftAppPassword"]);

            services.AddSingleton<BotFrameworkHttpAdapter, ComposerBotHttpAdapter>();

            services.AddSingleton<IBot, ComposerBot>();

            services.AddSingleton<SkillsConfiguration>();

            services.AddSingleton(sp => new AuthenticationConfiguration { ClaimsValidator = new AllowedSkillsClaimsValidator(sp.GetService<SkillsConfiguration>()) });

            services.AddSingleton<BotAdapter>(sp => sp.GetService<BotFrameworkHttpAdapter>());

            // Register the skills client and skills request handler.
            services.AddSingleton<SkillConversationIdFactoryBase, SkillConversationIdFactory>();
            services.AddHttpClient<SkillHttpClient>();
            services.AddSingleton<ChannelServiceHandler, SkillHandler>();
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
            app.UseWebSockets();

            //app.UseHttpsRedirection();
            app.UseMvc();
        }
    }
}
