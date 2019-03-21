import { ConnectorEdge } from '../../connectors/types/ConnectorEdge';
import { WhenHandler, YieldHandler, ConnectionPolicyCollection } from '../../connectors/types/ConnectionPolicy';

// Welcome should be connected to the only 'recognizer' directly.
const shouldWelcomeFireConnection: WhenHandler = (welcomeElements, root) => {
  return welcomeElements.length === 1 && root['recognizer'].length === 1;
};

const yieldWelcomeConnections: YieldHandler = (welcomeElements, root) => {
  return [
    {
      from: welcomeElements[0].path,
      to: root['recognizer'][0].path,
      why: 'WelcomeJump',
    },
  ];
};

// 'Intent's should be connected to the only 'recognizer' by their intent names.
const shouldIntentFireConnection: WhenHandler = (intentElements, root) => {
  return intentElements.length > 0 && root['recognizer'].length === 1;
};

const yieldIntentConnections: YieldHandler = (intentElements, root) => {
  const edges: ConnectorEdge[] = [];

  for (const intent of intentElements) {
    const intentKey = intent.data['intent'];
    const recognizer = root['recognizer'][0];
    const connection = recognizer.data['rules'][intentKey];

    if (connection) {
      edges.push({
        from: recognizer.path,
        to: intent.path,
        why: 'IntentJump',
        payload: {
          path: `${recognizer.path}.rules.${intentKey}`,
          data: connection,
        },
      });
    }
  }
  return edges;
};

/**
 * This policy example contains a implicit restriction:
 *  Fields other than 'welcome' and 'intent' shoudn't yield connections.
 */
export const ruleDialogPolicy: ConnectionPolicyCollection = {
  welcome: {
    when: shouldWelcomeFireConnection,
    buildConnections: yieldWelcomeConnections,
  },
  intent: {
    when: shouldIntentFireConnection,
    buildConnections: yieldIntentConnections,
  },
};
