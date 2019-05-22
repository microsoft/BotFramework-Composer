using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Builder.LanguageGeneration.Renderer;
using Microsoft.Bot.Builder.TestBot.Json;
using System.Collections.Generic;
namespace BotProject.Managers
{
    public interface IBotManager
    {
        BotInjectItem Current { get; }

        void Push(BotInjectItem botItem);
    }

    public class BotManager: IBotManager
    {
        private List<BotInjectItem> botInjectItems;
        private int currentIndex = -1;

        public BotInjectItem Current
        {
            get
            {
                if (botInjectItems == null
                    || botInjectItems.Count == 0
                    || currentIndex >= botInjectItems.Count)
                    return null;
                return botInjectItems[currentIndex];
            }
        }

        public void Push(BotInjectItem botItem)
        {
            if(botItem != null)
            {
                botInjectItems.Add(botItem);
                currentIndex ++;
            }
        }
    }

    public class BotInjectItem
    {
        public BotInjectItem(IBot bot, IBotFrameworkHttpAdapter adapter)
        {
            Bot = bot;
            Adapter = adapter;
        }

        public BotInjectItem(ResourceExplorer resourceExplorer, string rootDialog, int debugport = 4712)
        {
            IStorage storage = new MemoryStorage();
            var userState = new UserState(storage);
            var conversationState = new ConversationState(storage);

            var adapter = new BotFrameworkHttpAdapter();
            adapter
                .UseStorage(storage)
                .UseState(userState, conversationState)
                .UseLanguageGenerator(new LGLanguageGenerator(resourceExplorer))
                .UseDebugger(debugport)
                .UseResourceExplorer(resourceExplorer, () =>
                {
                });
            adapter.OnTurnError = async (turnContext, exception) =>
            {
                await turnContext.SendActivityAsync(exception.Message).ConfigureAwait(false);

                await conversationState.ClearStateAsync(turnContext).ConfigureAwait(false);
                await conversationState.SaveChangesAsync(turnContext).ConfigureAwait(false);
            };
            Adapter = adapter;

            Bot = new TestBot(rootDialog, conversationState, resourceExplorer, DebugSupport.SourceRegistry);
        }

        public IBot Bot { get; set; }
        public IBotFrameworkHttpAdapter Adapter { get; set; }
    }
}
