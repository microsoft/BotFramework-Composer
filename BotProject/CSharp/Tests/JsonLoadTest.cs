using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Declarative.Types;
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
    public class JsonLoadTest
    {
        private static string getOsPath(string path) => Path.Combine(path.TrimEnd('\\').Split('\\'));

        private static readonly string samplesDirectory = getOsPath(@"..\..\..\..\..\..\SampleBots");

        private static string getSingleSample(string path)
        {
            var botPath = Path.Combine(samplesDirectory, path, @"bot.botproj");
            var botProj = BotProject.Load(botPath);
            return botProj.entry;
        }

        private static ResourceExplorer resourceExplorer = new ResourceExplorer();

        [ClassInitialize]
        public static void ClassInitialize(TestContext context)
        {
            TypeFactory.Configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
            TypeFactory.RegisterAdaptiveTypes();
            string path = Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, samplesDirectory));
            resourceExplorer.AddFolder(path);
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            resourceExplorer.Dispose();
        }

        public TestContext TestContext { get; set; }

        [TestMethod]
        public async Task JsonDialogLoad_01Steps()
        {
            await BuildTestFlow(getSingleSample("01 - Steps"))
                .SendConversationUpdate()
                .AssertReply("Step 1")
                .AssertReply("Step 2")
                .AssertReply("Step 3")
            .StartTestAsync();
        }

        //[TestMethod]
        //public async Task JsonDialogLoad_02EndTurn()
        //{
        //    await BuildTestFlow(getSingleSample("02 - EndTurn"))
        //    .Send("hello")
        //        .AssertReply("What's up?")
        //    .Send("Nothing")
        //        .AssertReply("Oh I see!")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_03IfCondition()
        //{
        //    await BuildTestFlow(getSingleSample("03 - IfCondition"))
        //    .SendConversationUpdate()
        //    .AssertReply("Hello, I'm Zoidberg. What is your name?")
        //    .Send("Carlos")
        //    .AssertReply("Hello Carlos, nice to talk to you!")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_04TextInput()
        //{
        //    await BuildTestFlow(getSingleSample("04 - TextInput"))
        //    .SendConversationUpdate()
        //        .AssertReply("Hello, I'm Zoidberg. What is your name?")
        //    .Send("Carlos")
        //        .AssertReply("Hello Carlos, nice to talk to you!")
        //    .Send("hi")
        //        .AssertReply("Hello Carlos, nice to talk to you!")
        //        .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_05NumberInput()
        //{
        //    await BuildTestFlow(getSingleSample("05 - NumberInput"))
        //    .SendConversationUpdate()
        //        .AssertReply("What is your age?")
        //    .Send("Blablabla")
        //        .AssertReply("What is your age?")
        //    .Send("4")
        //        .AssertReply("Hello, your age is 4!")
        //        .AssertReply("2 * 2.2 equals?")
        //    .Send("4.4")
        //        .AssertReply("2 * 2.2 equals 4.4, that's right!")
        //        .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_14RepeatDialog()
        //{
        //    await BuildTestFlow(getSingleSample("14 - RepeatDialog"))
        //    .SendConversationUpdate()
        //        .AssertReply("RepeatDialog.main.dialog starting")
        //        .AssertReply("Hello, what is your name?")
        //    .Send("Carlos")
        //        .AssertReply("Hello Carlos, nice to meet you! (type cancel to end this)")
        //    .Send("hi")
        //        .AssertReply("RepeatDialog.main.dialog starting")
        //        .AssertReply("Hello Carlos, nice to meet you! (type cancel to end this)")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_15TraceAndLog()
        //{
        //    await BuildTestFlow(getSingleSample("15 - TraceAndLog"), sendTrace: true)
        //    .SendConversationUpdate()
        //        .AssertReply("Hello, what is your name?")
        //    .Send("Carlos")
        //        .AssertReply(activity =>
        //        {
        //            var trace = (Activity)activity;
        //            Assert.AreEqual(ActivityTypes.Trace, trace.Type, "should be trace activity");
        //            Assert.AreEqual("memory", trace.ValueType, "value type should be memory");
        //        })
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_06DoSteps()
        //{
        //    await BuildTestFlow(getSingleSample("06 - DoSteps"))
        //    .Send(new Activity(ActivityTypes.ConversationUpdate, membersAdded: new List<ChannelAccount>() { new ChannelAccount("bot", "Bot") }))
        //    .SendConversationUpdate()
        //        .AssertReply("Hello, I'm Zoidberg. What is your name?")
        //    .Send("Carlos")
        //        .AssertReply("Hello Carlos, nice to talk to you!")
        //        .AssertReply("Hey, I can tell you a joke, or tell your fortune")
        //    .Send("Do you know a joke?")
        //        .AssertReply("Why did the chicken cross the road?")
        //    .Send("Why?")
        //        .AssertReply("To get to the other side")
        //    .Send("What happened in the future?")
        //        .AssertReply("Seeing into the future...")
        //        .AssertReply("I see great things happening...")
        //        .AssertReply("Perhaps even a successful bot demo")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_07BeginDialog()
        //{
        //    await BuildTestFlow(getSingleSample("07 - BeginDialog"))
        //    .Send(new Activity(ActivityTypes.ConversationUpdate,
        //        membersAdded: new List<ChannelAccount>() { new ChannelAccount("bot", "Bot") }))
        //    .SendConversationUpdate()
        //        .AssertReply("Hello, I'm Zoidberg. What is your name?")
        //    .Send("Carlos")
        //        .AssertReply("Hello Carlos, nice to talk to you!")
        //        .AssertReply("Hey, I can tell you a joke, or tell your fortune")
        //    .Send("Do you know a joke?")
        //        .AssertReply("Why did the chicken cross the road?")
        //    .Send("Why?")
        //        .AssertReply("To get to the other side")
        //    .Send("What happened in the future?")
        //        .AssertReply("Seeing into the future...")
        //        .AssertReply("I see great things in your future...")
        //        .AssertReply("Potentially a successful demo")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_10ChoiceInputDialog()
        //{
        //    await BuildTestFlow(getSingleSample("10 - ChoiceInput"))
        //    .SendConversationUpdate()
        //        .AssertReply("Please select a value from below:\n\n   1. Test1\n   2. Test2\n   3. Test3")
        //    .Send("Test1")
        //        .AssertReply("You select: Test1")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_13SwitchCondition()
        //{
        //    await BuildTestFlow(getSingleSample("13 - SwitchCondition"))
        //    .SendConversationUpdate()
        //        .AssertReply("Please select a value from below:\n\n   1. Test1\n   2. Test2\n   3. Test3")
        //    .Send("Test1")
        //        .AssertReply("You select: Test1")
        //        .AssertReply("You select: 1")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_09EndDialog()
        //{
        //    await BuildTestFlow(getSingleSample("09 - EndDialog"))
        //    .Send(new Activity(ActivityTypes.ConversationUpdate,
        //        membersAdded: new List<ChannelAccount>() { new ChannelAccount("bot", "Bot") }))
        //    .SendConversationUpdate()
        //        .AssertReply("Hello, I'm Zoidberg. What is your name?")
        //    .Send("Carlos")
        //        .AssertReply("Hello Carlos, nice to talk to you!")
        //        .AssertReply("I'm a joke bot. To get started say \"joke\".")
        //    .Send("joke")
        //        .AssertReply("Why did the chicken cross the road?")
        //    .Send("never mind")
        //        .AssertReply("ok.")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_08ExternalLanguage()
        //{
        //    await BuildTestFlow(getSingleSample("08 - ExternalLanguage"))
        //    .SendConversationUpdate()
        //        .AssertReplyOneOf(new string[]
        //        {
        //            "Zoidberg here, welcome to my world!",
        //            "Hello, my name is Zoidberg and I'll be your guide.",
        //            "Hail Zoidberg!"
        //        })
        //        .AssertReplyOneOf(new string[]
        //        {
        //            "Hello. What is your name?",
        //            "I would like to know you better, what's your name?"
        //        })
        //    .Send("Carlos")
        //        .AssertReplyOneOf(new string[]
        //        {
        //            "Hello Carlos, nice to talk to you!",
        //            "Hi Carlos, you seem nice!",
        //            "Whassup Carlos?"
        //        })
        //    .Send("Help")
        //        .AssertReply("I can tell jokes and also forsee the future!\n")
        //    .Send("Do you know a joke?")
        //        .AssertReply("Why did the chicken cross the road?")
        //    .Send("Why?")
        //        .AssertReply("To get to the other side")
        //    .Send("What happened in the future?")
        //        .AssertReply("I see great things in your future...")
        //        .AssertReply("Potentially a successful demo")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_ToDoBot()
        //{
        //    await BuildTestFlow(getSingleSample("ToDoBot"))
        //    .Send(new Activity(ActivityTypes.ConversationUpdate, membersAdded: new List<ChannelAccount>() { new ChannelAccount("bot", "Bot") }))
        //    .SendConversationUpdate()
        //        .AssertReply("Hi! I'm a ToDo bot. Say \"add a todo named first\" to get started.")
        //    .Send("add a todo named first")
        //        .AssertReply("Successfully added a todo named \"first\"")
        //    .Send("add a todo named second")
        //        .AssertReply("Successfully added a todo named \"second\"")
        //    .Send("add a todo")
        //        .AssertReply("OK, please enter the title of your todo.")
        //    .Send("third")
        //        .AssertReply("Successfully added a todo named \"third\"")
        //    .Send("show todos")
        //        .AssertReply("Your most recent 3 tasks are\n* first\n* second\n* third\n")
        //    .Send("delete todo named second")
        //        .AssertReply("Successfully removed a todo named \"second\"")
        //    .Send("show todos")
        //        .AssertReply("Your most recent 2 tasks are\n* first\n* third\n")
        //    .Send("add a todo")
        //        .AssertReply("OK, please enter the title of your todo.")
        //    .Send("cancel")
        //        .AssertReply("ok.")
        //    .StartTestAsync();
        //}

        //[TestMethod]
        //public async Task JsonDialogLoad_11HttpRequest()
        //{
        //    await BuildTestFlow(getSingleSample("11 - HttpRequest"))
        //    .Send(new Activity(ActivityTypes.ConversationUpdate, membersAdded: new List<ChannelAccount>() { new ChannelAccount("bot", "Bot") }))
        //    .AssertReply("Welcome! Here is a http request sample, please enter a name for you visual pet.")
        //    .Send("TestPetName")
        //    .AssertReply("Great! Your pet's name is TestPetName")
        //    .AssertReply("Now please enter the id of your pet, this could help you find your pet later.")
        //    .Send("12121")
        //    .AssertReply("Done! You have added a pet named \"TestPetName\" with id \"12121\"")
        //    .AssertReply("Now try to specify the id of your pet, and I will help your find it out from the store.")
        //    .Send("12121")
        //    .AssertReply("Great! I found your pet named \"TestPetName\"")
        //    .StartTestAsync();
        //}

        private TestFlow BuildTestFlow(string resourceName, bool sendTrace = false)
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

            var resource = resourceExplorer.GetResource(resourceName);
            var dialog = DeclarativeTypeLoader.Load<IDialog>(resource, resourceExplorer, DebugSupport.SourceRegistry);

            return new TestFlow(adapter, async (turnContext, cancellationToken) =>
            {
                if (dialog is AdaptiveDialog planningDialog)
                {
                    await planningDialog.OnTurnAsync(turnContext, null, cancellationToken).ConfigureAwait(false);
                }
            });
        }
    }
}
