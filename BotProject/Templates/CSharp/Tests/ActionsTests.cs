﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Declarative.Types;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Tests
{
    [TestClass]
    public class ActionsTests
    {
        private static string getOsPath(string path) => Path.Combine(path.TrimEnd('\\').Split('\\'));

        private static readonly string samplesDirectory = getOsPath(@"..\..\..\..\..\..\..\Composer\packages\server\assets\projects");

        private static string getFolderPath(string path)
        {
            return Path.Combine(samplesDirectory, path);
        }


        [ClassInitialize]
        public static void ClassInitialize(TestContext context)
        {
            TypeFactory.Configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
            string path = Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, samplesDirectory));
        }

        public TestContext TestContext { get; set; }

        [TestMethod]
        public async Task Actions_01Actions()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine))
            .Send("01")
                .AssertReply("Step 1")
                .AssertReply("Step 2")
                .AssertReply("Step 3")
                .AssertReply("user.age is set to 18")
                .AssertReply("user.age is set to null")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_02EndTurn()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine))
            .Send("02")
                .AssertReply("What's up?")
            .Send("Nothing")
                .AssertReply("Oh I see!")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_03IfCondition()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("03")
                .AssertReply("Hello, I'm Zoidberg. What is your name?")
            .Send("Carlos")
                .AssertReply("Hello Carlos, nice to talk to you!")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_04EditArray()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("04")
                .AssertReply("Here are the index and values in the array.")
                .AssertReply("0: 11111")
                .AssertReply("1: 40000")
                .AssertReply("2: 222222")
                .AssertReply("If each page shows two items, here are the index and values")
                .AssertReply("0: 11111")
                .AssertReply("1: 40000")
                .AssertReply("0: 222222")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_05EndDialog()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("05")
                .AssertReply("Hello, I'm Zoidberg. What is your name?")
            .Send("luhan")
                .AssertReply("Hello luhan, nice to talk to you!")
                .AssertReply("I'm a joke bot. To get started say \"joke\".")
            .Send("joke")
                .AssertReply("Why did the chicken cross the road?")
            .Send("I don't know")
                .AssertReply("To get to the other side!")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_06SwitchCondition()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("07")
                .AssertReply("Please select a value from below:\n\n   1. Test1\n   2. Test2\n   3. Test3")
            .Send("Test1")
                .AssertReply("You select: Test1")
                .AssertReply("You select: 1")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_07RepeatDialog()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("08")
                .AssertReply("Do you want to repeat this dialog, yes to repeat, no to end this dialog (1) Yes or (2) No")
            .Send("Yes")
                .AssertReply("Do you want to repeat this dialog, yes to repeat, no to end this dialog (1) Yes or (2) No")
            .Send("No")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_08TraceAndLog()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"), sendTrace: true)
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("09")
            .Send("luhan")
                .AssertReply(activity =>
                {
                    var trace = (Activity)activity;
                    Assert.AreEqual(ActivityTypes.Trace, trace.Type, "should be trace activity");
                })
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_09EditActions()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("10")
                .AssertReply("Hello, I'm Zoidberg. What is your name?")
            .Send("luhan")
                .AssertReply("Hello luhan, nice to talk to you!")
                .AssertReply("Goodbye!")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_10ReplaceDialog()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("11")
                .AssertReply("Hello, I'm Zoidberg. What is your name?")
            .Send("luhan")
                .AssertReply("Hello luhan, nice to talk to you! Please either enter 'joke' or 'fortune' to replace the dialog you want.")
            .Send("joke")
                .AssertReply("Why did the chicken cross the road?")
            .Send("Why?")
                .AssertReply("To get to the other side!")
            .Send("future")
                .AssertReply("Seeing into your future...")
                .AssertReply("I see great things in your future!")
                .AssertReply("Potentially a successful demo")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_11EmitEvent()
        {
            await BuildTestFlow(getFolderPath("ActionsSample"))
            .SendConversationUpdate()
                .AssertReply(String.Format("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.{0}01 - Actions{0}02 - EndTurn{0}03 - IfCondiftion{0}04 - EditArray, Foreach{0}05 - EndDialog{0}06 - HttpRequest{0}07 - SwitchCondition{0}08 - RepeatDialog{0}09 - TraceAndLog{0}10 - EditActions{0}11 - ReplaceDialog{0}12 - EmitEvent{0}13 - QnAMaker", Environment.NewLine)).Send("12")
                .AssertReply("Say moo to get a response, say emit to emit a event.")
            .Send("moo")
                .AssertReply("Yippee ki-yay!")
            .Send("emit")
                .AssertReply("CustomEvent Fired.")
            .StartTestAsync();
        }

        private TestFlow BuildTestFlow(string folderPath, bool sendTrace = false)
        {
            TypeFactory.Configuration = new ConfigurationBuilder().Build();
            var storage = new MemoryStorage();
            var convoState = new ConversationState(storage);
            var userState = new UserState(storage);
            var adapter = new TestAdapter(TestAdapter.CreateConversation(TestContext.TestName), sendTrace);
            var resourceExplorer = new ResourceExplorer();
            resourceExplorer.AddFolder(folderPath);
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
  
  