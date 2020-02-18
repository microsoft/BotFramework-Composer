// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FieldProps } from '@bfc/extension';
import omit from 'lodash/omit';

import { unsupportedField } from './styles';

export const UnsupportedField: React.FC<FieldProps> = function UnsupportedField(props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <React.Fragment>
      <div css={unsupportedField.container}>
        {props.label} (Unsupported Field)
        <Link styles={unsupportedField.link} onClick={() => setShowDetails(prev => !prev)}>
          Toggle Details
        </Link>
      </div>
      <pre css={unsupportedField.details(!showDetails)}>
        props: {JSON.stringify(omit(props, ['definitions']), null, 2)}
      </pre>
    </React.Fragment>
  );
};
