// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import NewBotPage from './newBotPage';
import CustomizeBotPage from './customizeBotPage';
import PreProvisionPage from './preProvisionPage';

interface VirtualAssistantCreationModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // handleCreateNew: (formData: any, );
  onDismiss: () => void;
  handleCreateNew: (formData, templateId: string) => void;
  formData: any;
}

export const VirtualAssistantCreationModal: React.FC<VirtualAssistantCreationModalProps> = (props) => {
  console.log(props.location);
  return (
    <Fragment>
      <Router>
        <NewBotPage path="projects/create/va-core" />
        <CustomizeBotPage path="projects/create/va-core/test" />
        <PreProvisionPage path="projects/create/va-core/preprovisioning" />
      </Router>
    </Fragment>
  );
};

export default VirtualAssistantCreationModal;
