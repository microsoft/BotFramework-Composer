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
import * as helpers from "../src/shared/helpers";
import { SkillConversationIdFactory } from "../src/shared/skillConversationIdFactory";

const samplesDirectory = path.resolve(
  __dirname,
  "../../../Composer/plugins/samples/assets/projects",
  "ControllingConversationFlowSample"
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
      return await bot.onTurnActivity(context);
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
describe("test runtime used ControllingConversationFlowSample", () => {
  it("runtime can Controlling Conversation", async () => {
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        'Welcome to the Controlling Conversation sample. Choose from the list below to try.\nYou can also type "Cancel" to cancel any dialog or "Endturn" to explicitly accept an input.'
      )
      .send("01")
      .assertReply("Hello, What's your age?")
      .send("18")
      .assertReply(
        "Your age is 18 which satisified the condition that was evaluated"
      )
      .send("02")
      .assertReply("Who are your?\n\n   1. Susan\n   2. Nick\n   3. Tom")
      .send("2")
      .assertReply("You selected Nick")
      .assertReply('This is the logic inside the "Nick" switch block.')
      .send("03")
      .assertReply("Pushed dialog.id into a list")
      .assertReply("0: 11111")
      .assertReply("1: 40000")
      .assertReply("2: 222222")
      .send("04")
      .assertReply("Pushed dialog.ids into a list")
      .assertReply("0: 11111")
      .assertReply("1: 40000")
      .assertReply("0: 222222")
      .send("06")
      .send("hi")
      .send("07")
      .assertReply(
        "Do you want to repeat this dialog, yes to repeat, no to end this dialog (1) Yes or (2) No"
      )
      .send("Yes")
      .assertReply(
        "Do you want to repeat this dialog, yes to repeat, no to end this dialog (1) Yes or (2) No"
      )
      .send("No")
      .send("08")
      .assertReply("In continue loop, which only outputs dual.")
      .assertReply("index: 1 value: 2")
      .assertReply("index: 3 value: 4")
      .assertReply("index: 5 value: 6")
      .assertReply("In break loop, which breaks when index > 2")
      .assertReply("index: 0 value: 1")
      .assertReply("index: 1 value: 2")
      .assertReply("index: 2 value: 3")
      .assertReply("done")
      .send("09")
      .assertReply("counter: 1")
      .assertReply("counter: 2")
      .startTest();
  });
});
