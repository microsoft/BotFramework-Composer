import * as path from "path";
import { ResourceExplorer } from "botbuilder-dialogs-declarative";
import { AdaptiveDialogComponentRegistration } from "botbuilder-dialogs-adaptive";
import {
  TestAdapter,
  ConversationState,
  MemoryStorage,
  UserState,
} from "botbuilder";
import { ComposerBot } from "../src/shared/composerBot";
import { SkillConversationIdFactory } from "../src/shared/skillConversationIdFactory";
import * as helpers from "../src/shared/helpers";
import { ActivityTypes, Activity, ChannelAccount } from "botframework-schema";
import { TurnContext } from "botbuilder-core";

const samplesDirectory = path.resolve(
  __dirname,
  "../../../Composer/plugins/samples/assets/projects",
  "ActionsSample"
);

const resourceExplorer = new ResourceExplorer();
const basicActiivty: Partial<Activity> = {
  channelId: "test",
  serviceUrl: "https://test.com",
  from: { id: "user1", name: "User1" },
  recipient: { id: "bot", name: "Bot" },
  locale: "en-us",
  conversation: {
    isGroup: false,
    conversationType: "testFlowConversationId",
    id: "testFlowConversationId",
    tenantId: "test",
    name: "test",
  },
};

const conversationUpdateActivity = {
  ...basicActiivty,
  type: ActivityTypes.ConversationUpdate,
  membersAdded: [{ id: "test", name: "testAccount" } as ChannelAccount],
  membersRemoved: [],
} as Activity;

let bot: ComposerBot;
let adapter: TestAdapter;

const getProjectRoot = jest
  .spyOn(helpers, "getProjectRoot")
  .mockImplementation(() => samplesDirectory);
const getSettings = jest
  .spyOn(helpers, "getSettings")
  .mockImplementation((root: string) => {
    return { defaultLocale: "en-us" };
  });

beforeAll(() => {
  resourceExplorer.addFolders(samplesDirectory, ["runtime"], false);
  resourceExplorer.addComponent(
    new AdaptiveDialogComponentRegistration(resourceExplorer)
  );
  adapter = new TestAdapter(
    async (context: TurnContext): Promise<any> => {
      // Route activity to bot.
      return await bot.onTurnActivity(context);
    },
    basicActiivty,
    false
  );
});

beforeEach(() => {
  const memoryStorage = new MemoryStorage();

  // Create shared user state and conversation state instances.
  const userState = new UserState(memoryStorage);
  const conversationState = new ConversationState(memoryStorage);
  // Create shared skill conversation id factory instance.
  const skillConversationIdFactory = new SkillConversationIdFactory();
  bot = new ComposerBot(
    userState,
    conversationState,
    skillConversationIdFactory
  );
});

afterEach(() => {
  // adapter = null;
  bot = null;
});

describe("test runtime used ActionsSample", () => {
  it("Actions_01Actions", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("01")
      .assertReply("Step 1")
      .assertReply("Step 2")
      .assertReply("Step 3")
      .assertReply("user.age is set to 18")
      .assertReply("user.age is set to null")
      .startTest();
  });

  it("Actions_02EndTurn", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("02")
      .assertReply("What's up?")
      .send("Nothing")
      .assertReply("Oh I see!")
      .startTest();
  });
  it("Actions_03IfCondition", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("03")
      .assertReply("Hello, I'm Zoidberg. What is your name?")
      .send("Carlos")
      .assertReply("Hello Carlos, nice to talk to you!")
      .startTest();
  });
  it("Actions_04EditArray", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("04")
      .assertReply("Here are the index and values in the array.")
      .assertReply("0: 11111")
      .assertReply("1: 40000")
      .assertReply("2: 222222")
      .assertReply(
        "If each page shows two items, here are the index and values"
      )
      .assertReply("0: 11111")
      .assertReply("1: 40000")
      .assertReply("0: 222222")
      .startTest();
  });
  it("Actions_05EndDialog", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("05")
      .assertReply("Hello, I'm Zoidberg. What is your name?")
      .send("luhan")
      .assertReply("Hello luhan, nice to talk to you!")
      .assertReply('I\'m a joke bot. To get started say "joke".')
      .send("joke")
      .assertReply("Why did the chicken cross the road?")
      .send("I don't know")
      .assertReply("To get to the other side!")
      .startTest();
  });

  it("Actions_06SwitchCondition", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("07")
      .assertReply(
        "Please select a value from below:\n\n   1. Test1\n   2. Test2\n   3. Test3"
      )
      .send("Test1")
      .assertReply("You select: Test1")
      .assertReply("You select: 1")
      .startTest();
  });

  it("Actions_07RepeatDialog", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("08")
      .assertReply(
        "Do you want to repeat this dialog, yes to repeat, no to end this dialog (1) Yes or (2) No"
      )
      .send("Yes")
      .assertReply(
        "Do you want to repeat this dialog, yes to repeat, no to end this dialog (1) Yes or (2) No"
      )
      .send("No")
      .startTest();
  });
  it("Actions_09EditActions", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("10")
      .assertReply("Hello, I'm Zoidberg. What is your name?")
      .send("luhan")
      .assertReply("Hello luhan, nice to talk to you!")
      .assertReply("Goodbye!")
      .startTest();
  });
  it("Actions_10ReplaceDialog", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("11")
      .assertReply("Hello, I'm Zoidberg. What is your name?")
      .send("luhan")
      .assertReply(
        "Hello luhan, nice to talk to you! Please either enter 'joke' or 'fortune' to replace the dialog you want."
      )
      .send("joke")
      .assertReply("Why did the chicken cross the road?")
      .send("Why?")
      .assertReply("To get to the other side!")
      .send("future")
      .assertReply("Seeing into your future...")
      .assertReply("I see great things in your future!")
      .assertReply("Potentially a successful demo")
      .startTest();
  });
  it("Actions_11EmitEvent", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("12")
      .assertReply("Say moo to get a response, say emit to emit a event.")
      .send("moo")
      .assertReply("Yippee ki-yay!")
      .send("emit")
      .assertReply("CustomEvent Fired.")
      .startTest();
  });

  it("Actions_08TraceAndLog", async () => {
    // use different adapter to support trace activity
    adapter = new TestAdapter(
      async (context: TurnContext): Promise<any> => {
        // Route activity to bot.
        return await bot.onTurnActivity(context);
      },
      basicActiivty,
      true
    );
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "I can show you examples on how to use actions. Enter the number next to the entity that you with to see in action.\n01 - Actions\n02 - EndTurn\n03 - IfCondiftion\n04 - EditArray, Foreach\n05 - EndDialog\n06 - HttpRequest\n07 - SwitchCondition\n08 - RepeatDialog\n09 - TraceAndLog\n10 - EditActions\n11 - ReplaceDialog\n12 - EmitEvent\n13 - QnAMaker"
      )
      .send("09")
      .send("luhan")
      .assertReply((activity) => {
        expect(activity.type).toBe(ActivityTypes.Trace);
      })
      .startTest();
  });
});
