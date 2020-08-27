// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import NewBotPage from './newBotPage';
import CustomizeBotPage from './customizeBotPage';
import PreProvisionPage from './preProvisionPage';
import { AppContextDefaultValue } from '../models/stateModels';

interface VirtualAssistantCreationModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // handleCreateNew: (formData: any, );
  onDismiss: () => void;
  handleCreateNew: (formData, templateId: string) => void;
  formData: any;
}

export const AppContext = React.createContext(AppContextDefaultValue);

export const VirtualAssistantCreationModal: React.FC<VirtualAssistantCreationModalProps> = (props) => {
  const [state, setState] = useState(AppContextDefaultValue.state);

  return (
    <Fragment>
      <AppContext.Provider value={{ state, setState }}>
        <Router>
          <NewBotPage path="/" default />
          <CustomizeBotPage path="options" />
          <PreProvisionPage path="preProvision" />
        </Router>
      </AppContext.Provider>
    </Fragment>
  );
};

export default VirtualAssistantCreationModal;
