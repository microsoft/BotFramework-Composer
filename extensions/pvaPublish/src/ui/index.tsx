import * as React from 'react';
import { render } from '@bfc/extension-client';
import { initializeIcons } from '@uifabric/icons';

import { PVADialog } from './authDialog';

initializeIcons();

render(<PVADialog />);
