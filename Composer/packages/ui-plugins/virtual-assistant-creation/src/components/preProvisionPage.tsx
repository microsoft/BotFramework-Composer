// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

interface PreProvisionPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // Add Props Here
}

export const PreProvisionPage: React.FC<PreProvisionPageProps> = (props) => {
  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        // onDismiss={null}
        title={'test'}
        subText={'test testefa'}
        dialogType={DialogTypes.DesignFlow}
      ></DialogWrapper>
    </Fragment>
  );
};

export default PreProvisionPage;
