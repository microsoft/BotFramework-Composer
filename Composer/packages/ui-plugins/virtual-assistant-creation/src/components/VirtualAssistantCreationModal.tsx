// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

interface ImportQnAFromUrlModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // handleCreateNew: (formData: any, );
  onDismiss: () => void;
  handleCreateNew: (formData, templateId: string) => void;
  formData: any;
}

export const VirtualAssistantCreationModal: React.FC<ImportQnAFromUrlModalProps> = (props) => {
  return (
    <DialogWrapper
      isOpen={true}
      // onDismiss={null}
      title={'test'}
      subText={'test test'}
      dialogType={DialogTypes.DesignFlow}
    ></DialogWrapper>
  );
};

export default VirtualAssistantCreationModal;
