// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useMemo, useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { StoreContext } from '../../../store';

import { modalControlGroup } from './style';

export interface EjectModalProps {
  ejectRuntime: (templateKey: string) => void;
  hidden: boolean;
  closeModal: () => void;
}

export const EjectModal: React.FC<EjectModalProps> = (props) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();
  const { state, actions } = useContext(StoreContext);
  const { runtimeTemplates } = state;

  useEffect(() => {
    actions.getRuntimeTemplates();
  }, []);

  const availableRuntimeTemplates = useMemo(() => {
    return runtimeTemplates.map((t) => {
      return {
        text: t.name,
        key: t.key,
      };
    });
  }, [runtimeTemplates]);

  const selectTemplate = (ev, item?: IChoiceGroupOption) => {
    if (item) {
      setSelectedTemplate(item.key);
    }
  };

  const doEject = () => {
    if (selectedTemplate) {
      props.ejectRuntime(selectedTemplate);
    }
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Add custom runtime'),
        subText: formatMessage('Select runtime version to add'),
      }}
      hidden={props.hidden}
      modalProps={{
        isBlocking: false,
      }}
      onDismiss={props.closeModal}
    >
      <div css={modalControlGroup}>
        <ChoiceGroup required options={availableRuntimeTemplates} onChange={selectTemplate} />
      </div>
      <DialogFooter>
        <DefaultButton onClick={props.closeModal}>Cancel</DefaultButton>
        <PrimaryButton disabled={!selectedTemplate} onClick={doEject}>
          {formatMessage('Okay')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  );
};
