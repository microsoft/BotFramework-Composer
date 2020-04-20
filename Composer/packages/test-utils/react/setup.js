// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { setIconOptions } from 'office-ui-fabric-react/lib/Styling';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Suppress icon warnings.
setIconOptions({
  disableWarnings: true,
});

afterEach(cleanup);
