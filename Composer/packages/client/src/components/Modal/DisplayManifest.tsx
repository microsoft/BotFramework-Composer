// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useEffect, useMemo } from 'react';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/components/Dialog';
import { IDragOptions } from 'office-ui-fabric-react/lib/Modal';
import { JsonEditor } from '@bfc/code-editor';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';

import { displayManifest as styles } from './styles';

const dragOptions: IDragOptions = {
  moveMenuItemText: 'Move',
  closeMenuItemText: 'Close',
  menu: ContextualMenu,
};

interface DisplayManifestModalProps {
  isDraggable?: boolean;
  isModeless?: boolean;
  manifestId?: string | null;
  onDismiss: () => void;
}

export const DisplayManifestModal: React.FC<DisplayManifestModalProps> = ({
  isDraggable = true,
  isModeless = true,
  manifestId,
  onDismiss,
}) => {
  const { state } = useContext(StoreContext);
  const { skills } = state;

  useEffect(() => onDismiss, []);

  const selectedSkill = useMemo(() => skills.find(({ manifestUrl }) => manifestUrl === manifestId), [manifestId]);

  if (!selectedSkill) {
    return null;
  }

  return (
    <Dialog
      hidden={false}
      dialogContentProps={{
        type: DialogType.close,
        title: formatMessage('{skillName} Manifest', { skillName: selectedSkill.name }),
        styles: styles.dialog,
      }}
      modalProps={{
        dragOptions: isDraggable ? dragOptions : undefined,
        isBlocking: false,
        isModeless,
        styles: styles.modal,
      }}
      onDismiss={onDismiss}
    >
      <div css={styles.content}>
        <JsonEditor
          id={'modaljsonview'}
          onChange={() => {}}
          value={JSON.parse(selectedSkill.body || '')}
          height={'100%'}
          options={{ readOnly: true }}
        />
      </div>
      <DialogFooter>
        <PrimaryButton text={formatMessage('Close')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};

export default DisplayManifestModal;
