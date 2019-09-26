using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Declarative.Types;
using Microsoft.Bot.Builder.ComposerBot.json;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Tests
{
    [TestClass]
    public class ToDoBotTests
    {
        private static string getOsPath(string path) => Path.Combine(path.TrimEnd('\\').Split('\\'));

        private static readonly string samplesDirectory = getOsPath(@"..\..\..\..\..\..\SampleBots");

        private static ResourceExplorer resourceExplorer = new ResourceExplorer();


        [ClassInitialize]
        public static void ClassInitialize(TestContext context)
        {
            TypeFactory.Configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
            TypeFactory.RegisterAdaptiveTypes();
            string path = Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, samplesDirectory, "ToDoBot"));
            resourceExplorer.AddFolder(path);
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            resourceExplorer.Dispose();
        }

        public TestContext TestContext { get; set; }

        [TestMethod]
        public async Task ToDoBotTest()
        {
            await BuildTestFlow()
            .SendConversationUpdate()
                .AssertReply("Hi! I'm a ToDo bot. Say \"add a todo named first\" to get started.")
            .Send("add a todo named first")
                .AssertReply("Successfully added a todo named first")
            .Send("add a todo named second")
                .AssertReply("Successfully added a todo named second")
            .Send("add a todo")
                .AssertReply("OK, please enter the title of your todo.")
            .Send("third")
                .AssertReply("Successfully added a todo named third")
            .Send("show todos")
                .AssertReply("Your most recent 3 tasks are\n* first\n* second\n* third\n")
            .Send("delete todo named second")
                .AssertReply("Successfully removed a todo named second")
            .Send("show todos")
                .AssertReply("Your most recent 2 tasks are\n* first\n* third\n")
            .StartTestAsync();
        }

        private TestFlow BuildTestFlow(bool sendTrace = false)
        {
            TypeFactory.Configuration = new ConfigurationBuilder().Build();
            var storage = new MemoryStorage();
            var convoState = new ConversationState(storage);
            var userState = new UserState(storage);
            var adapter = new TestAdapter(TestAdapter.CreateConversation(TestContext.TestName), sendTrace);
            adapter
                .UseStorage(storage)
                .UseState(userState, convoState)
                .UseLanguageGeneration(resourceExplorer)
                .UseResourceExplorer(resourceExplorer)
                .Use(new TranscriptLoggerMiddleware(new FileTranscriptLogger()));

            var resource = resourceExplorer.GetResource("Main.dialog");
            var dialog = DeclarativeTypeLoader.Load<IDialog>(resource, resourceExplorer, DebugSupport.SourceRegistry);
            DialogManager dm = new DialogManager(dialog);

            return new TestFlow(adapter, async (turnContext, cancellationToken) =>
            {
                if (dialog is AdaptiveDialog planningDialog)
                {
                    await dm.OnTurnAsync(turnContext, null, cancellationToken).ConfigureAwait(false);
                }
            });
        }
    }
}
