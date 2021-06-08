// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FieldProps } from '@bfc/extension-client';
import omit from 'lodash/omit';
import formatMessage from 'format-message';

import { unsupportedField } from './styles';

export const UnsupportedField: React.FC<FieldProps> = function UnsupportedField(props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <React.Fragment>
      <div css={unsupportedField.container} data-testid="UnsupportedField">
        {props.label} (Unsupported Field)
        <Link styles={unsupportedField.link} onClick={() => setShowDetails((prev) => !prev)}>
          {formatMessage('Toggle Details')}
        </Link>
      </div>
      <pre css={unsupportedField.details(!showDetails)} data-testid="UnsupportedFieldDetails">
        props: {JSON.stringify(omit(props, ['definitions']), null, 2)}
      </pre>
    </React.Fragment>
  );
};
