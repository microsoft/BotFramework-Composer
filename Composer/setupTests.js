import { setIconOptions } from 'office-ui-fabric-react/lib/Styling';
import formatMessage from 'format-message';
import 'jest-dom/extend-expect';
import { cleanup } from 'react-testing-library';

// Suppress icon warnings.
setIconOptions({
  disableWarnings: true,
});

formatMessage.setup({
  missingTranslation: 'ignore',
});

afterEach(cleanup);
