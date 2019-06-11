import { initializeIcons } from '@uifabric/icons';
import formatMessage from 'format-message';

import App from './App';

initializeIcons();
formatMessage.setup({
  missingTranslation: 'ignore',
});

export default App;
