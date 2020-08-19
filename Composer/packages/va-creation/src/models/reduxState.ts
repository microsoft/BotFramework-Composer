import { defaultStyleOptions } from '../packages/webchatEditor/constants';

export interface IAppState {
  // WebChatEditorState: IWebChatEditorState;
  NavState: INavState;
  WebChatState: IWebChatState;
  CreationState: ICreationState;
}

export interface ICreationState {
  availableHostedSkills: IAvailableHostedSkill[];
  availableAssistantTemplates: IAssistant[];
  selectedAssistant: IAssistant;
  selectedBotName: string;
  selectedUserInput: string[];
  selectedLanguages: string[];
  selectedPersonality: string;
  selectedWelcomeImage: string;
  selectedFallbackText: string;
  selectedGreetingMessage: string;
  selectedSkills: IAvailableHostedSkill[];
  selectedQnaFile: string;
}

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

export interface IWebChatState {
  styleOptions: WebChatStyleOption;
  jsonIsInvalid: boolean;
}

// TODO: Figure out way to get strongly types style Options obj that maps to https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/defaultStyleOptions.js
export interface WebChatStyleOption {
  accent: string;
  backgroundColor: string;
  cardEmphasisBackgroundColor: string;
  paddingRegular: number;
  paddingWide: number;
  subtle: string;
  messageActivityWordBreak: string;
  fontSizeSmall: string;
  monospaceFont: string;
  primaryFont: string;
  avatarBorderRadius: string;
  avatarSize: number;
  botAvatarImage: string;
  botAvatarInitials: string;
  userAvatarImage: string;
  userAvatarInitials: string;
  bubbleBackground: string;
  bubbleBorderColor: string;
  bubbleBorderRadius: number;
  bubbleBorderStyle: string;
  bubbleBorderWidth: number;
  bubbleFromUserBackground: string;
  bubbleFromUserBorderColor: string;
  bubbleFromUserBorderRadius: number;
  bubbleFromUserBorderStyle: string;
  bubbleFromUserBorderWidth: number;
  bubbleFromUserNubOffset: string;
  bubbleFromUserNubSize: number;
  bubbleFromUserTextColor: string;
  bubbleImageHeight: number;
  bubbleMaxWidth: number;
  bubbleMinHeight: number;
  bubbleMinWidth: number;
  bubbleNubOffset: string;
  bubbleNubSize: number;
  bubbleTextColor: string;
  markdownRespectCRLF: boolean;
  richCardWrapTitle: boolean;
  rootHeight: string;
  rootWidth: string;
  rootZIndex: number;
  hideScrollToEndButton: boolean;
  hideSendBox: boolean;
  hideUploadButton: boolean;
  microphoneButtonColorOnDictate: string;
  sendBoxBackground: string;
  sendBoxButtonColorOnDisabled: string;
  sendBoxButtonColorOnFocus: string;
  sendBoxButtonColorOnHover: string;
  sendBoxHeight: number;
  sendBoxMaxHeight: number;
  sendBoxTextColor: string;
  sendBoxBorderBottom: string;
  sendBoxBorderLeft: string;
  sendBoxBorderRight: string;
  sendBoxBorderTop: string;
  sendBoxTextWrap: boolean;
  showSpokenText: boolean;
  suggestedActionBackground: string;
  suggestedActionBorderRadius: number;
  suggestedActionBorderStyle: string;
  suggestedActionBorderWidth: number;
  suggestedActionDisabledBorder?: null;
  suggestedActionDisabledBorderColor: string;
  suggestedActionDisabledBorderStyle: string;
  suggestedActionDisabledBorderWidth: number;
  suggestedActionHeight: number;
  suggestedActionImageHeight: number;
  suggestedActionLayout: string;
  suggestedActionTextColor?: null;
  suggestedActionsStackedOverflow?: null;
  groupTimestamp: boolean;
  sendTimeout: number;
  sendTimeoutForAttachments: number;
  timestampFormat: string;
  newMessagesButtonFontSize: string;
  transcriptOverlayButtonBackground: string;
  transcriptOverlayButtonBackgroundOnFocus: string;
  transcriptOverlayButtonBackgroundOnHover: string;
  transcriptOverlayButtonColor: string;
  videoHeight: number;
  connectivityIconPadding: number;
  connectivityMarginLeftRight: number;
  connectivityMarginTopBottom: number;
  connectivityTextSize: string;
  failedConnectivity: string;
  slowConnectivity: string;
  notificationText: string;
  slowConnectionAfter: number;
  typingAnimationBackgroundImage?: null;
  typingAnimationDuration: number;
  typingAnimationHeight: number;
  typingAnimationWidth: number;
  spinnerAnimationBackgroundImage?: null;
  spinnerAnimationHeight: number;
  spinnerAnimationWidth: number;
  spinnerAnimationPadding: number;
  enableUploadThumbnail: boolean;
  uploadThumbnailContentType: string;
  uploadThumbnailHeight: number;
  uploadThumbnailQuality: number;
  uploadThumbnailWidth: number;
  notificationDebounceTimeout: number;
  hideToaster: boolean;
  toasterHeight: number;
  toasterMaxHeight: number;
  toasterSingularMaxHeight: number;
  toastFontSize: string;
  toastIconWidth: number;
  toastSeparatorColor: string;
  toastTextPadding: number;
  toastErrorBackgroundColor: string;
  toastErrorColor: string;
  toastInfoBackgroundColor: string;
  toastInfoColor: string;
  toastSuccessBackgroundColor: string;
  toastSuccessColor: string;
  toastWarnBackgroundColor: string;
  toastWarnColor: string;
}

export interface IWebChatEditorState {}

export interface INavState {
  history: string[];
  activePath: string;
  sideBarEntries: ISideBarEntry[];
}

export interface ISideBarEntry {
  name: string;
  path: string;
  key: number;
  iconName: string;
}

export const initialNavState: INavState = {
  history: [],
  activePath: '/',
  sideBarEntries: [
    {
      name: 'Home',
      key: 1,
      path: '/',
      iconName: 'HomeSolid',
    },
    {
      path: '/botSettings',
      name: 'About',
      key: 2,
      iconName: 'Settings',
    },
    {
      path: '/webChatEditor',
      name: 'WebChatEditor',
      key: 3,
      iconName: 'ActivityFeed',
    },
    {
      path: '/creationExperience',
      name: 'CreationExperience',
      key: 3,
      iconName: 'WebAppBuilderFragmentCreate',
    },
  ],
};

export const initialWebChatState: IWebChatState = {
  styleOptions: defaultStyleOptions,
  jsonIsInvalid: false,
};

export const initialCreationState: ICreationState = {
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
      name: 'Custom Assistant',
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
    name: 'Custom Assistant',
    description: 'Configured with simple conversational capability like greeting, chit-chat & more.',
    imgName: 'customAssistant.jpg',
  },
  selectedBotName: '',
  selectedUserInput: [],
  selectedLanguages: [],
  selectedPersonality: '',
  selectedWelcomeImage: '',
  selectedFallbackText: '',
  selectedGreetingMessage: '',
  selectedSkills: [],
  selectedQnaFile: '',
};

export const initialAppState: IAppState = {
  NavState: initialNavState,
  WebChatState: initialWebChatState,
  CreationState: initialCreationState,
};
