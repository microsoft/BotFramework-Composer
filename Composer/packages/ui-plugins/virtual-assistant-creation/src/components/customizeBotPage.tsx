// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

interface CustomizeBotPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // Add Props Here
}

export const CustomizeBotPage: React.FC<CustomizeBotPageProps> = (props) => {
  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        // onDismiss={null}
        title={'Customize your assistant'}
        subText={
          'Give your bot personality, multi-language capabilities and more. You can edit this later in Bot Settings.'
        }
        dialogType={DialogTypes.DesignFlow}
      ></DialogWrapper>
    </Fragment>
  );
};

export default CustomizeBotPage;
