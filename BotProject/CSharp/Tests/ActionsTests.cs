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
    public class ActionsTests
    {
        private static string getOsPath(string path) => Path.Combine(path.TrimEnd('\\').Split('\\'));

        private static readonly string samplesDirectory = getOsPath(@"..\..\..\..\..\..\SampleBots");

        private static string getFolderPath(string path)
        {
            return Path.Combine(samplesDirectory, path);
        }


        [ClassInitialize]
        public static void ClassInitialize(TestContext context)
        {
            TypeFactory.Configuration = new ConfigurationBuilder().AddInMemoryCollection().Build();
            TypeFactory.RegisterAdaptiveTypes();
            string path = Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, samplesDirectory));
        }

        public TestContext TestContext { get; set; }

        [TestMethod]
        public async Task Actions_01Actions()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
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
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("02")
                .AssertReply("What's up?")
            .Send("Nothing")
                .AssertReply("Oh I see!")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_03IfCondition()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("03")
                .AssertReply("Hello, I'm Zoidberg. What is your name?")
            .Send("Carlos")
                .AssertReply("Hello Carlos, nice to talk to you!")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_04EditArray()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("04")
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
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("05")
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
        public async Task Actions_06HttpRequest()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("06")
                .AssertReply("Welcome! Here is a http request sample, please enter a name for you visual pet.")
            .Send("TestPetName")
                .AssertReply("Great! Your pet's name is TestPetName")
                .AssertReply("Now please enter the id of your pet, this could help you find your pet later.")
            .Send("88888")
                .AssertReply("Done! You have added a pet named \"TestPetName\" with id \"88888\"")
                .AssertReply("Now try to specify the id of your pet, and I will help your find it out from the store.")
            .Send("88888")
                .AssertReply("Great! I found your pet named \"TestPetName\"")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_07SwitchCondition()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("07")
                .AssertReply("Please select a value from below:\n\n   1. Test1\n   2. Test2\n   3. Test3")
            .Send("Test1")
                .AssertReply("You select: Test1")
                .AssertReply("You select: 1")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_08RepeatDialog()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("08")
                .AssertReply("Hello, what is your name?")
            .Send("luhan")
                .AssertReply("Hello luhan, nice to meet you!")
            .Send("hi")
                 .AssertReply("Hello, what is your name?")
            .Send("luhan")
                .AssertReply("Hello luhan, nice to meet you!")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_09TraceAndLog()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"), sendTrace: true)
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("09")
                .AssertReply("Hello, what is your name?")
            .Send("luhan")
                .AssertReply(activity =>
                {
                    var trace = (Activity)activity;
                    Assert.AreEqual(ActivityTypes.Trace, trace.Type, "should be trace activity");
                    Assert.AreEqual("memory", trace.ValueType, "value type should be memory");
                })
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_10Editactions()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("10")
                .AssertReply("Hello, I'm Zoidberg. What is your name?")
            .Send("luhan")
                .AssertReply("Hello luhan, nice to talk to you!")
                .AssertReply("Goodbye!")
            .StartTestAsync();
        }

        [TestMethod]
        public async Task Actions_11ReplaceDialog()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("11")
                .AssertReply("Hello, I'm Zoidberg. What is your name?")
            .Send("luhan")
                .AssertReply("Hello luhan, nice to talk to you!")
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
        public async Task Actions_12EmitEvent()
        {
            await BuildTestFlow(getFolderPath("Steps_Samples"))
            .SendConversationUpdate()
                .AssertReply("I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n")
            .Send("12")
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
