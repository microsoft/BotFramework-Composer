import { YieldHandler } from '../../../../connectors/types/ConnectionPolicy';
import { ConnectorEdge } from '../../../../connectors/types/ConnectorResults';

// Welcome should be connected to the only 'recognizer' directly.
export const yieldWelcomeConnections: YieldHandler = (welcomeElements, root) => {
  return [
    {
      from: welcomeElements[0].path,
      to: root['recognizer'][0].path,
      why: 'WelcomeJump',
    },
  ];
};

// 'Intent's should be connected to the only 'recognizer' by their intent names.
export const yieldIntentConnections: YieldHandler = (intentElements, root) => {
  const edges: ConnectorEdge[] = [];
  const recognizer = root['recognizer'][0];

  for (const intent of intentElements) {
    const intentKey = intent.data['intent'];
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
