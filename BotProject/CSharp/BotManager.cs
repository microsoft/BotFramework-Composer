using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Builder.LanguageGeneration.Renderer;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public interface IBotManager
    { 
        IBotFrameworkHttpAdapter CurrentAdapter { get; }
        IBot CurrentBot { get;  }

        void SetCurrent(BotProject botProj);
    }

    public class BotManager : IBotManager
    {
        public BotManager(IConfiguration config)
        {
            Config = config;

            var bot = Config.GetSection("bot").Get<string>();
            var botProj = BotProject.Load(bot);
            SetCurrent(botProj);
        }

        private IConfiguration Config { get; }

        public IBotFrameworkHttpAdapter CurrentAdapter { get; set; }

        public IBot CurrentBot { get; set; }

        public void SetCurrent(BotProject botProject)
        {
            IStorage storage = new MemoryStorage();
            var userState = new UserState(storage);
            var conversationState = new ConversationState(storage);
            var rootDialog = botProject.entry;

            // manage all bot resources
            var resourceExplorer = new ResourceExplorer();
            foreach (var folder in botProject.Folders)
            {
                resourceExplorer.AddFolder(folder);
            }

            var adapter = new BotFrameworkHttpAdapter();

            adapter
                .UseStorage(storage)
                .UseState(userState, conversationState)
                .UseLanguageGenerator(new LGLanguageGenerator(resourceExplorer))
                .UseDebugger(4712)
                .UseResourceExplorer(resourceExplorer);
            adapter.OnTurnError = async (turnContext, exception) =>
            {
                await turnContext.SendActivityAsync(exception.Message).ConfigureAwait(false);

                await conversationState.ClearStateAsync(turnContext).ConfigureAwait(false);
                await conversationState.SaveChangesAsync(turnContext).ConfigureAwait(false);
            };
            CurrentAdapter = adapter;

            CurrentBot = new TestBot(rootDialog, conversationState, resourceExplorer, DebugSupport.SourceRegistry);
        }
    }
}