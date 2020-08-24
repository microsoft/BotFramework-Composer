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
  "TodoSample"
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

jest
  .spyOn(helpers, "getProjectRoot")
  .mockImplementation(() => samplesDirectory);
jest.spyOn(helpers, "getSettings").mockImplementation((root: string) => {
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

describe("test runtime used TodoSample", () => {
  it("test runtime can run todoBot correctly", async () => {
    // create conversation update activity
    const conversationUpdateActivity = {
      ...basicActiivty,
      type: ActivityTypes.ConversationUpdate,
      membersAdded: [{ id: "test", name: "testAccount" } as ChannelAccount],
      membersRemoved: [],
    } as Activity;
    await adapter
      .send(conversationUpdateActivity)
      .assertReply(
        'Hi! I\'m a ToDo bot. Say "add a todo named first" to get started.'
      )
      .send("add a todo named first")
      .assertReplyOneOf(["Successfully added a todo named first"])
      .send("add a todo named second")
      .assertReply("Successfully added a todo named second")
      .send("add a todo")
      .assertReply("OK, please enter the title of your todo.")
      .send("third")
      .assertReply("Successfully added a todo named third")
      .send("show todos")
      .assertReply("Your most recent 3 tasks are\n* first\n* second\n* third")
      .send("delete todo named second")
      .assertReply("Successfully removed a todo named second")
      .send("show todos")
      .assertReply("Your most recent 2 tasks are\n* first\n* third")
      .startTest();
  });
});
