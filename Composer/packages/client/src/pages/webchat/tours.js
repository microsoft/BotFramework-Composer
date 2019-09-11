import './tours.css';

const createMyTour = () => {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
      },
      classes: 'shadow-md bg-purple-dark',
      scrollTo: true,
      classPrefix: 'zeye-',
      exitOnEsc: true,
    },
  });
  return tour;
};

const AboutComposer = createMyTour();
AboutComposer.addSteps([
  {
    id: 'AboutComposer-01',
    text: 'Here is the Flow editor, your can create an edit your bot logic here.',
    attachTo: {
      element: '#AboutComposer-DesignFlow',
      on: 'right',
    },
    buttons: [
      {
        text: 'Next',
        action: AboutComposer.next,
      },
    ],
  },
  {
    id: 'AboutComposer-02',
    text: 'Here is the LG editor, you can manage what your bot says here.',
    attachTo: {
      element: '#AboutComposer-BotSays',
      on: 'right',
    },
    buttons: [
      {
        text: 'Back',
        action: AboutComposer.back,
      },
      {
        text: 'Next',
        action: AboutComposer.next,
      },
    ],
  },
  {
    id: 'AboutComposer-03',
    text:
      "Here is the LU editor, you can manage how your bot recoganize user inputs and extract intents. Basically, it's managed by LUIS.",
    attachTo: {
      element: '#AboutComposer-UserSays',
      on: 'right',
    },
    buttons: [
      {
        text: 'Back',
        action: AboutComposer.back,
      },
      {
        text: 'Next',
        action: AboutComposer.next,
      },
    ],
  },
  {
    id: 'AboutComposer-04',
    text: 'Here is your setting page. You can manage your composer settings here. Such as LUIS token, App Id.',
    attachTo: {
      element: '#AboutComposer-Settings',
      on: 'right',
    },
    buttons: [
      {
        text: 'Back',
        action: AboutComposer.back,
      },
      {
        text: 'Done',
        action: AboutComposer.complete,
      },
    ],
  },
]);

const AboutDialogEditor = createMyTour();
AboutDialogEditor.addSteps([
  {
    id: 'AboutDialogEditor-01',
    text:
      'Here is your project tree. It contains all your dialog files. Basically, each dialog file should contain a complete dialog. Inside a dialog, there will be some events and actions.',
    attachTo: {
      element: '#ProjectTree',
      on: 'right',
    },
    buttons: [
      {
        text: 'Next',
        action: AboutDialogEditor.next,
      },
    ],
  },
  {
    id: 'AboutDialogEditor-02',
    text: 'Here is the Visual Edior. In Visual Editor, you can edit your dialog step flow visually.',
    attachTo: {
      element: '#VisualEditorIframe',
      on: 'right',
    },
    buttons: [
      {
        text: 'Back',
        action: AboutDialogEditor.back,
      },
      {
        text: 'Next',
        action: AboutDialogEditor.next,
      },
    ],
  },
  {
    id: 'AboutDialogEditor-03',
    text: 'Here is the Form Editor. In Form Editor, you can do more detailed editing on the element your selected.',
    attachTo: {
      element: '#FormEditorIframe',
      on: 'right',
    },
    buttons: [
      {
        text: 'Back',
        action: AboutDialogEditor.back,
      },
      {
        text: 'Done',
        action: AboutDialogEditor.complete,
      },
    ],
  },
]);

const AddNewTrigger = createMyTour();
AddNewTrigger.addSteps([
  {
    id: 'AddNewTrigger-01',
    text:
      "Firstly, you need to click the 'Add New Trigger' button to create a trigger. A trigger is where your dialog actions live in. Let's create an 'ConversationUpdate' trigger.",
    attachTo: {
      element: '#AddNewTriggerBtn',
      on: 'right',
    },
    buttons: [
      {
        text: 'Next',
        action: AddNewTrigger.next,
      },
    ],
  },
  {
    id: 'AddNewTrigger-02',
    text:
      "Here is the trigger node you just added. Now click on this node and editor its properties. For example, you can give a name 'WelcomeTrigger'",
    attachTo: {
      element: '#TriggerNode',
      on: 'right',
    },
    buttons: [
      {
        text: 'Back',
        action: AddNewTrigger.back,
      },
      {
        text: 'Next',
        action: AddNewTrigger.next,
      },
    ],
  },
  {
    id: 'AddNewTrigger-03',
    text:
      "Now you can start editing your step flow. Define everything you what your bot to do by adding actions. You can click on the '+' button to add actons you want.",
    attachTo: {
      element: '#StepEditor',
      on: 'right',
    },
    buttons: [
      {
        text: 'Back',
        action: AddNewTrigger.back,
      },
      {
        text: 'Done',
        action: AddNewTrigger.complete,
      },
    ],
  },
]);

window.AboutComposer = AboutComposer;
window.AboutDialogEditor = AboutDialogEditor;
window.AddNewTrigger = AddNewTrigger;

window.startWizard = tourName => {
  if (window[tourName]) {
    window.hideWebchat();
    console.log('found tour', tourName);
    window[tourName].start();
  } else {
    console.log('no tour');
  }
};
