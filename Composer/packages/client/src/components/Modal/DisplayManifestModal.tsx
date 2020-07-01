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
  moveMenuItemText: formatMessage('Move'),
  closeMenuItemText: formatMessage('Close'),
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
  const { skills, userSettings } = state;

  useEffect(() => onDismiss, []);

  const selectedSkill = useMemo(() => skills.find(({ manifestUrl }) => manifestUrl === manifestId), [manifestId]);

  if (!selectedSkill) {
    return null;
  }

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.close,
        title: formatMessage('{skillName} Manifest', { skillName: selectedSkill.name }),
        styles: styles.dialog,
      }}
      hidden={false}
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
          editorSettings={userSettings.codeEditor}
          height={'100%'}
          id={'modaljsonview'}
          options={{ readOnly: true }}
          value={JSON.parse(selectedSkill.body ?? '')}
          onChange={() => {}}
        />
      </div>
      <DialogFooter>
        <PrimaryButton text={formatMessage('Close')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};

export default DisplayManifestModal;
