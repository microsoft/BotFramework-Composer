// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Declarative.Types;
using Microsoft.Bot.Builder.LanguageGeneration;
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
    public class ControllingConversationTests
    {
        private static string getOsPath(string path) => Path.Combine(path.TrimEnd('\\').Split('\\'));

        private static readonly string samplesDirectory = getOsPath(@"..\..\..\..\..\..\..\Composer\packages\server\assets\projects");

        private static ResourceExplorer resourceExplorer = new ResourceExplorer();


        [ClassInitialize]
        public static void ClassInitialize(TestContext context)
        {
            TypeFactory.Configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
            string path = Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, samplesDirectory, "ControllingConversationFlowSample"));
            resourceExplorer.AddFolder(path);
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            resourceExplorer.Dispose();
        }

        public TestContext TestContext { get; set; }

        [TestMethod]
        public async Task ControllingConversationBotTest()
        {
            await BuildTestFlow()
            .SendConversationUpdate()
                .AssertReply(String.Format("Welcome to the Controlling Conversation sample. Choose from the list below to try.{0}You can also type \"Cancel\" to cancel any dialog or \"Endturn\" to explicitly accept an input.", Environment.NewLine))
            .Send("01")
                .AssertReply("Hello, What's your age?")
            .Send("18")
                .AssertReply("Your age is 18 which satisified the condition that was evaluated")
            .Send("02")
                .AssertReply("Who are your?\n\n   1. Susan\n   2. Nick\n   3. Tom")
            .Send("2")
                .AssertReply("You selected Nick")
                .AssertReply("This is the logic inside the \"Nick\" switch block.")
            .Send("03")
                .AssertReply("Pushed dialog.id into a list")
                .AssertReply("0: 11111")
                .AssertReply("1: 40000")
                .AssertReply("2: 222222")
            .Send("04")
                .AssertReply("Pushed dialog.ids into a list")
                .AssertReply("0: 11111")
                .AssertReply("1: 40000")
                .AssertReply("0: 222222")
            .Send("06")
            .Send("hi")
            .Send("07")
                .AssertReply("Do you want to repeat this dialog, yes to repeat, no to end this dialog (1) Yes or (2) No")
            .Send("Yes")
                .AssertReply("Do you want to repeat this dialog, yes to repeat, no to end this dialog (1) Yes or (2) No")
            .Send("No")
            .Send("05")
                .AssertReply("Canceled.")
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
            var dialog = DeclarativeTypeLoader.Load<AdaptiveDialog>(resource, resourceExplorer, DebugSupport.SourceMap);
            DialogManager dm = new DialogManager(dialog);

            return new TestFlow(adapter, async (turnContext, cancellationToken) =>
            {
                if (dialog is AdaptiveDialog planningDialog)
                {
                    await dm.OnTurnAsync(turnContext, cancellationToken).ConfigureAwait(false);
                }
            });
        }
    }
}
