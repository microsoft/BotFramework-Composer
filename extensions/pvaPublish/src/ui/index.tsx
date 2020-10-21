import * as React from 'react';
import { render } from '@bfc/extension-client';
import { initializeIcons } from '@uifabric/icons';

import { PVADialog } from './pvaDialog';

initializeIcons();

render(<PVADialog />);
