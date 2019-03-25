import { TraceableConnectorPolicy } from '../../connectors/types/ConnectionPolicy';
import { shouldIntentFireConnection, shouldWelcomeFireConnection } from './handlers/connector/when';
import { yieldIntentConnections, yieldWelcomeConnections } from './handlers/connector/buildConnections';

/**
 * This policy example contains a implicit restriction:
 *  Fields other than 'welcome' and 'intent' shoudn't yield connections.
 */
export const ruleDialogConnectorPolicy: TraceableConnectorPolicy<any, any> = {
  welcome: {
    when: shouldWelcomeFireConnection,
    buildConnections: yieldWelcomeConnections,
  },
  intent: {
    when: shouldIntentFireConnection,
    buildConnections: yieldIntentConnections,
  },
};
