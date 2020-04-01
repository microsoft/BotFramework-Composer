// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import formatMessage from 'format-message';
import { container } from './styles';
export var LoadingSpinner = function() {
  return jsx('div', { css: container }, jsx(Spinner, { label: formatMessage('Loading') }));
};
//# sourceMappingURL=LoadingSpinner.js.map
