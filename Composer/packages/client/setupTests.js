import { setIconOptions } from 'office-ui-fabric-react/lib/Styling';
import 'jest-dom/extend-expect';
import { cleanup } from 'react-testing-library';

// Suppress icon warnings.
setIconOptions({
  disableWarnings: true,
});

afterEach(cleanup);
