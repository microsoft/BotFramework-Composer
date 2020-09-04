import { Dispatch, SetStateAction } from 'react';
import { AvailablePersonalities } from './creationOptions';

export type IAppState = {
  availableHostedSkills: IAvailableHostedSkill[];
  availableAssistantTemplates: IAssistant[];
  selectedAssistant: IAssistant;
  selectedBotName: string;
  isTextEnabled: boolean;
  isSpeechEnabled: boolean;
  selectedLanguages: string[];
  selectedPersonality: AvailablePersonalities;
  selectedWelcomeImage: string;
  selectedFallbackText: string;
  selectedGreetingMessage: string;
  selectedSkills: IAvailableHostedSkill[];
  selectedQnaFile: string;
};

export type AppContextValue = {
  state: IAppState;
  // type, you get when hovering over `setState` from `useState`
  setState: Dispatch<SetStateAction<IAppState>>;
};

export interface IAssistant {
  name: string;
  description: string;
  imgName: string;
  templateConfig?: ITemplateConfig;
}

// TODO create obj to be outputted from creation experience and used for provisioning and creation of botSchema
export interface ITemplateConfig {}

export interface IAvailableHostedSkill {
  name: string;
  description: string;
  location?: string;
}

export const initialAppState: IAppState = {
  availableHostedSkills: [
    {
      name: 'POI',
      description: 'Find points of interest and directions',
    },
    {
      name: 'To Do',
      description: 'Add task management capabilities to your assistant',
    },
    {
      name: 'Calendar',
      description: 'Add calendar capabilities to your Assistant',
    },
    {
      name: 'Who',
      description: 'Add person look up capabilities to your Assistant',
    },
  ],
  availableAssistantTemplates: [
    {
      name: 'Basic Assistant',
      description: 'Configured with simple conversational capability like greeting, chit-chat & more.',
      imgName: 'customAssistant.jpg',
    },
    {
      name: 'Enterprise Assistant',
      description: 'Configured with enterprise scenarios, calendar, who bot, professional chit-chat.',
      imgName: 'EnterpriseAssistant.jpg',
    },
    {
      name: 'Hospitality Assistant',
      description: 'Configured with hospitality scenarios, Bing search and caring chit-chat.',
      imgName: 'hospitality.jpg',
    },
  ],
  selectedAssistant: {
    name: 'Basic Assistant',
    description: 'Configured with simple conversational capability like greeting, chit-chat & more.',
    imgName: 'customAssistant.jpg',
  },
  selectedBotName: '',
  isTextEnabled: true,
  isSpeechEnabled: false,
  selectedLanguages: [],
  selectedPersonality: AvailablePersonalities.professional,
  selectedWelcomeImage: '',
  selectedFallbackText: "I am sorry, I didn't understand that",
  selectedGreetingMessage: 'Hi there! Here are some things that I can do!',
  selectedSkills: [],
  selectedQnaFile: '',
};

//////////////////////

export const AppContextDefaultValue: AppContextValue = {
  state: initialAppState,
  setState: (state) => {}, // noop default callback
};
