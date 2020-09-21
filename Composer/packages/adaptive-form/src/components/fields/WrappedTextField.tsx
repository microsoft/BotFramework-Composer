// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import React from 'react';

export class WrappedTextField extends React.Component<ITextFieldProps> {
  shouldComponentUpdate(nextProps: ITextFieldProps) {
    if (this.props.value === nextProps.value) {
      return false;
    }

    return true;
  }

  render() {
    return <TextField {...this.props} />;
  }
}
