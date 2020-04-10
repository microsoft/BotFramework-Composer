// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { StoreContext } from '../../../store';

export const EjectModal = props => {
  const [availableRuntimeTemplates, setRuntimeTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState();
  const { state, actions } = useContext(StoreContext);
  const { runtimeTemplates } = state;

  useEffect(() => {
    actions.getRuntimeTemplates();
  }, []);

  useEffect(() => {
    // format for use in a choicegroup
    const formatted = runtimeTemplates.map(t => {
      return {
        ...t,
        text: t.name,
        key: t.name,
      };
    });

    // set to choicegroup variable
    setRuntimeTemplates(formatted);
  }, [runtimeTemplates]);

  const selectTemplate = (ev, template) => {
    setSelectedTemplate(template);
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
      <ChoiceGroup options={availableRuntimeTemplates} onChange={selectTemplate} required={true} />
      <DialogFooter>
        <DefaultButton onClick={props.closeModal}>Cancel</DefaultButton>
        <PrimaryButton onClick={doEject} disabled={!selectedTemplate}>
          Okay
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  );
};
