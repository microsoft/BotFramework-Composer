// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { setIconOptions } from 'office-ui-fabric-react/lib/Styling';
import '@testing-library/jest-dom';
import { cleanup as reactCleanup } from '@testing-library/react';
import { cleanup as hooksCleanup } from '@testing-library/react-hooks';

// Suppress icon warnings.j
setIconOptions({
  disableWarnings: true,
});

afterEach(() => {
  reactCleanup();
  hooksCleanup();
});
