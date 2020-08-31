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
import { ActivityTypes, Activity, ChannelAccount } from "botframework-schema";
import { TurnContext } from "botbuilder-core";
import { SkillConversationIdFactory } from "../src/shared/skillConversationIdFactory";
import * as helpers from "../src/shared/helpers";

const samplesDirectory = path.resolve(
  __dirname,
  "../../../Composer/plugins/samples/assets/projects",
  "AskingQuestionsSample"
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

const getProjectRoot = jest
  .spyOn(helpers, "getProjectRoot")
  .mockImplementation(() => samplesDirectory);
const getSettings = jest
  .spyOn(helpers, "getSettings")
  .mockImplementation((root: string) => {
    return { defaultLocale: "en-us" };
  });

let bot: ComposerBot;
let adapter: TestAdapter;
beforeAll(() => {
  resourceExplorer.addFolders(samplesDirectory, ["runtime"], false);
  resourceExplorer.addComponent(
    new AdaptiveDialogComponentRegistration(resourceExplorer)
  );
  adapter = new TestAdapter(
    async (context: TurnContext): Promise<any> => {
      // Route activity to bot.
      await bot.onTurnActivity(context);
    },
    basicActiivty,
    false
  );

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
afterAll(() => {
  bot = null;
  adapter = null;
});
describe("test runtime used AskingQuestionsSample", () => {
  it("runtime can accept text inputs", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "Welcome to Input Sample Bot.\nI can show you examples on how to use actions, You can enter number 01-07\n01 - TextInput\n02 - NumberInput\n03 - ConfirmInput\n04 - ChoiceInput\n05 - AttachmentInput\n06 - DateTimeInput\n07 - OAuthInput"
      )
      .send("01")
      .assertReply(
        "Hello, I'm Zoidberg. What is your name? (This can't be interrupted)"
      )
      .send("02")
      .assertReply("Hello 02, nice to talk to you!")
      .startTest();
  });
  it("runtime can accept number inputs", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "Welcome to Input Sample Bot.\nI can show you examples on how to use actions, You can enter number 01-07\n01 - TextInput\n02 - NumberInput\n03 - ConfirmInput\n04 - ChoiceInput\n05 - AttachmentInput\n06 - DateTimeInput\n07 - OAuthInput"
      )
      .send("02")
      .assertReply("What is your age?")
      .send("18")
      .assertReply("Hello, your age is 18!")
      .assertReply("2 * 2.2 equals?")
      .send("4.4")
      .assertReply("2 * 2.2 equals 4.4, that's right!")
      .startTest();
  });
  it("runtime can accept confirm inputs", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "Welcome to Input Sample Bot.\nI can show you examples on how to use actions, You can enter number 01-07\n01 - TextInput\n02 - NumberInput\n03 - ConfirmInput\n04 - ChoiceInput\n05 - AttachmentInput\n06 - DateTimeInput\n07 - OAuthInput"
      )
      .send("03")
      .assertReply("yes or no (1) Yes or (2) No")
      .send("asdasd")
      .assertReply("I need a yes or no. (1) Yes or (2) No")
      .send("yes")
      .assertReply("confirmation: true")
      .startTest();
  });
  it("runtime can accept choice inputs", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "Welcome to Input Sample Bot.\nI can show you examples on how to use actions, You can enter number 01-07\n01 - TextInput\n02 - NumberInput\n03 - ConfirmInput\n04 - ChoiceInput\n05 - AttachmentInput\n06 - DateTimeInput\n07 - OAuthInput"
      )
      .send("04")
      .assertReply(
        "Please select a value from below:\n\n   1. Test1\n   2. Test2\n   3. Test3"
      )
      .send("Test1")
      .assertReply("You select: Test1")
      .startTest();
  });
  it("runtime can accept datetime inputs", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        "Welcome to Input Sample Bot.\nI can show you examples on how to use actions, You can enter number 01-07\n01 - TextInput\n02 - NumberInput\n03 - ConfirmInput\n04 - ChoiceInput\n05 - AttachmentInput\n06 - DateTimeInput\n07 - OAuthInput"
      )
      .send("06")
      .assertReply("Please enter a date.")
      .send("June 1st 2019")
      .assertReply("You entered: 2019-06-01")
      .startTest();
  });
});
