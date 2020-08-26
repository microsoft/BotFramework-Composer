// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

interface NewBotPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // Add Props Here
}

export const NewBotPage: React.FC<NewBotPageProps> = (props) => {
  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        // onDismiss={null}
        title={'Create New'}
        subText={'Create a new bot or choose from Virtual assistant templates. Learn More'}
        dialogType={DialogTypes.DesignFlow}
      ></DialogWrapper>
    </Fragment>
  );
};

export default NewBotPage;
