using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Declarative.Types;
using Microsoft.Bot.Builder.LanguageGeneration;
using Microsoft.Bot.Builder.TestBot.Json;
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
    public class MessageTests
    {
        private static string getOsPath(string path) => Path.Combine(path.TrimEnd('\\').Split('\\'));

        private static readonly string samplesDirectory = getOsPath(@"..\..\..\..\..\..\SampleBots");

        private static ResourceExplorer resourceExplorer = new ResourceExplorer();


        [ClassInitialize]
        public static void ClassInitialize(TestContext context)
        {
            TypeFactory.Configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
            string path = Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, samplesDirectory, "Message_Samples"));
            resourceExplorer.AddFolder(path);
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            resourceExplorer.Dispose();
        }

        public TestContext TestContext { get; set; }

        [TestMethod]
        public async Task MessageTest()
        {
            await BuildTestFlow()
            .SendConversationUpdate()
                .AssertReply("What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. Text With LG\n   4. LGWithParam\n   5. LGComposition")
            .Send("1")
                .AssertReply("Here is a simple text message.")
                .AssertReply("What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. Text With LG\n   4. LGWithParam\n   5. LGComposition")
            .Send("2")
                .AssertReply("This is a text saved in memory.")
                .AssertReply("What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. Text With LG\n   4. LGWithParam\n   5. LGComposition")
            .Send("3")
                .AssertReplyOneOf(new string[] { "Hello, this is a text with LG", "Hi, this is a text with LG", "Hey, this is a text with LG" })
                .AssertReply("What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. Text With LG\n   4. LGWithParam\n   5. LGComposition")
            .Send("4")
                .AssertReply("Hello, I'm Zoidberg. What is your name?")
            .Send("luhan")
                .AssertReply("Hello luhan, nice to talk to you!")
                .AssertReply("What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. Text With LG\n   4. LGWithParam\n   5. LGComposition")
            .Send("5")
                .AssertReply("luhan nice to talk to you!")
                .AssertReply("What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. Text With LG\n   4. LGWithParam\n   5. LGComposition")
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
                .UseAdaptiveDialogs()
                .UseLanguageGeneration(resourceExplorer, "common.lg")
                .UseResourceExplorer(resourceExplorer)
                .Use(new TranscriptLoggerMiddleware(new FileTranscriptLogger()));

            var resource = resourceExplorer.GetResource("Main.dialog");
            var dialog = DeclarativeTypeLoader.Load<AdaptiveDialog>(resource, resourceExplorer, DebugSupport.SourceRegistry);
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
