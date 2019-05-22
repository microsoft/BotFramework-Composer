// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using BotProject.Managers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder.BotFramework;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Declarative.Types;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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

            // Get Bot file
            string rootDialog = string.Empty;

            var botFile = Configuration.GetSection("bot").Get<BotFile>();
            var botProject = BotProject.Load(botFile);
            rootDialog = botProject.entry;

            // manage all bot resources
            var resourceExplorer = new ResourceExplorer();
            foreach (var folder in botProject.Folders)
            {
                resourceExplorer.AddFolder(folder);
            }
            // TODO get rid of this dependency
            TypeFactory.Configuration = this.Configuration;
            
            var botManager = new BotManager();
            botManager.Push(new BotInjectItem(resourceExplorer, rootDialog, Configuration.GetValue<int>("debugport", 4712)));
            services.AddSingleton<IBotManager, BotManager>((sp) => botManager);
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
