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
  "RespondingWithTextSample"
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

describe("test runtime used RespondingWithTextSample", () => {
  it("test runtime can send message and receive message correctly", async () => {
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
        "What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. LGWithParam\n   4. LGComposition\n   5. Structured LG\n   6. MultiLineText\n   7. IfElseCondition\n   8. SwitchCondition"
      )
      .send("1")
      .assertReplyOneOf([
        "Hi, this is simple text",
        "Hey, this is simple text",
        "Hello, this is simple text",
      ])
      .assertReply(
        "What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. LGWithParam\n   4. LGComposition\n   5. Structured LG\n   6. MultiLineText\n   7. IfElseCondition\n   8. SwitchCondition"
      )
      .send("2")
      .assertReply("This is a text saved in memory.")
      .assertReply(
        "What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. LGWithParam\n   4. LGComposition\n   5. Structured LG\n   6. MultiLineText\n   7. IfElseCondition\n   8. SwitchCondition"
      )
      .send("3")
      .assertReply("Hello, I'm Zoidberg. What is your name?")
      .send("luhan")
      .assertReply("Hello luhan, nice to talk to you!")
      .assertReply(
        "What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. LGWithParam\n   4. LGComposition\n   5. Structured LG\n   6. MultiLineText\n   7. IfElseCondition\n   8. SwitchCondition"
      )
      .send("4")
      .assertReply("luhan nice to talk to you!")
      .assertReply(
        "What type of message would you like to send?\n\n   1. Simple Text\n   2. Text With Memory\n   3. LGWithParam\n   4. LGComposition\n   5. Structured LG\n   6. MultiLineText\n   7. IfElseCondition\n   8. SwitchCondition"
      )
      .startTest();
  });
});
