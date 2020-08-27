// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

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
        title={'Provisioning Summary'}
        subText={'The following resources will be provisioned for you'}
        dialogType={DialogTypes.CreateFlow}
      >
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} />
          <PrimaryButton
            data-testid="SubmitNewBotBtn"
            text={formatMessage('Next')}
            onClick={() => {
              navigate(`./options`);
            }}
          />
        </DialogFooter>
      </DialogWrapper>
    </Fragment>
  );
};

export default PreProvisionPage;
