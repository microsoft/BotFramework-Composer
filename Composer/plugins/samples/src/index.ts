// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import fs from 'fs';

const samplesDir = path.resolve(__dirname, '../assets/projects');
const boilerplateDir = path.resolve(__dirname, '../assets/shared');

const samplesRegitry = {
  '*': {  // base registry item, can be override by later specific entry
    tags: ["Basic"],
    support: ["C#", "JS"]
  },
  EchoBot: {
    name: 'Echo Bot',
    description: 'A bot that echoes and responds with whatever message the user entered',
    index: 1,
  },
  EmptyBot: {
    name: 'Empty Bot',
    description: 'A basic bot template that is ready for your creativity',
    index: 2,
  },
  TodoSample: {
    name: 'Simple Todo',
    description: 'A sample bot that allows you to add, list, and remove to do items.',
    index: 3,
  },
  ToDoBotWithLuisSample: {
    name: 'Todo with LUIS',
    description: 'A sample bot that allows you to add, list, and remove to do items using Language Understanding',
    index: 4,
  },
  RespondingWithCardsSample: {
    name: 'Responding with Cards',
    description: 'A sample bot that uses Language Generation to create cards.',
  },
  AskingQuestionsSample: {
    name: 'Asking Questions',
    description: 'A sample bot that shows how to ask questions and capture user input.',
  },
  InterruptionSample: {
    name: 'Interruptions',
    description: 'An advanced sample bot that shows how to handle context switching and interruption in a conversation.',
  },
  RespondingWithTextSample: {
    name: 'Responding with Text',
    description: 'A sample bot that uses Language Generation to create bot responses.',
  },
  ControllingConversationFlowSample: {
    name: 'Controlling Conversation Flow',
    description: 'A sample bot that shows how to control the flow of a conversation.',
  },
  ActionsSample: {
    name: 'Dialog Actions',
    description: 'A sample bot that shows how to use Dialog Actions.',
  },
  QnAMakerLUISSample: {
    name: 'QnA Maker and LUIS',
    description: 'A sample bot that demonstrates use of both QnA Maker & LUIS',
  },
  QnASample: {
    name: 'QnA Sample',
    description: 'A sample bot that import online QnA resource',
  }
}


function getSamples(): any[] {
  const subPaths = fs.readdirSync(samplesDir);
  const samples = [];
  for (const subPath of subPaths) {
    const fullPath = samplesDir + "/" + subPath;
    if (!fs.statSync(fullPath).isDirectory()) {
      continue;
    }

    // only looking for directories
    const dirname = subPath;
    let sample = { id: dirname, name: dirname, description: dirname, path: fullPath, ...samplesRegitry['*'] };
    if (samplesRegitry[sample.id]) {
      sample = { ...sample, ...samplesRegitry[sample.id] };
    }
    samples.push(sample);
  }
  samples.sort((a, b) => {
    if (a.index && b.index) {
      return a.index - b.index;
    }
    if (a.index) {
      return -1;
    }
    return 1;
  })
  return samples;
}

function getBoilerplates() {
  return [
    {
      id: "boilerplate",
      name: "boilerplate",
      description: "base template for every bot template",
      path: boilerplateDir,
      tags: ["boilerplate"],
      support: ["*"],
    }
  ]
}

const samples = getSamples();
const boilerplates = getBoilerplates();

export default async (composer: any): Promise<void> => {
  // register this publishing method with Composer
  for (const temlate of samples) {
    await composer.addBotTemplate(temlate);
  }

  for (const temlate of boilerplates) {
    await composer.addBaseTemplate(temlate);
  }
};