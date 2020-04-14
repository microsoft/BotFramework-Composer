// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { StoreContext } from '../../../store';

import { modalControlGroup } from './style';

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
        key: t.key,
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
      }}
      modalProps={{
        isBlocking: false,
      }}
    >
      <div css={modalControlGroup}>
        <ChoiceGroup options={availableRuntimeTemplates} onChange={selectTemplate} required={true} />
      </div>
      <DialogFooter>
        <DefaultButton onClick={props.closeModal}>Cancel</DefaultButton>
        <PrimaryButton onClick={doEject} disabled={!selectedTemplate}>
          {formatMessage('Okay')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  );
};
