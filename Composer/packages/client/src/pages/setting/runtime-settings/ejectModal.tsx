// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';

export const EjectModal = props => {
  const [runtimeTemplates, setRuntimeTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState();

  useEffect(() => {
    setRuntimeTemplates([
      {
        key: 'csharp',
        text: 'C#',
        extra: 'field',
      },
      {
        key: 'js',
        text: 'Javascript',
      },
    ]);
  }, []);

  const selectTemplate = (ev, template) => {
    setSelectedTemplate(template);
    console.log('SELECTED', template);
  };

  const doEject = () => {
    if (selectedTemplate) {
      props.ejectRuntime(selectedTemplate);
    }
  };

  return (
    <Dialog
      hidden={props.hidden}
      onDismiss={props.closeModal}
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Add custom runtime'),
        subText: formatMessage('Select runtime version to add'),
        // styles: styles.dialog,
      }}
      modalProps={{
        isBlocking: false,
        // styles: styles.modal,
      }}
    >
      <ChoiceGroup options={runtimeTemplates} onChange={selectTemplate} required={true} />
      <DialogFooter>
        <DefaultButton onClick={props.closeModal}>Cancel</DefaultButton>
        <PrimaryButton onClick={doEject} disabled={!selectedTemplate}>
          Okay
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  );
};
