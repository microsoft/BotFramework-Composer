import { initializeIcons } from '@uifabric/icons';
import formatMessage from 'format-message';

import ObiFormEditor from './ObiFormEditor';

initializeIcons();
formatMessage.setup({
  missingTranslation: 'ignore',
});

export default ObiFormEditor;
