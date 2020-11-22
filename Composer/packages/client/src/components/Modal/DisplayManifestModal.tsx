// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useEffect, useMemo } from 'react';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/components/Dialog';
import { IDragOptions } from 'office-ui-fabric-react/lib/Modal';
import { JsonEditor } from '@bfc/code-editor';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { FontSizes } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { IDialogContentStyles } from 'office-ui-fabric-react/lib/Dialog';
import { IModalStyles } from 'office-ui-fabric-react/lib/Modal';
import { useRecoilValue } from 'recoil';

import { skillNameIdentifierByProjectIdSelector, skillsStateSelector, userSettingsState } from '../../recoilModel';

// -------------------- Styles -------------------- //

const styles: { content: any; dialog: Partial<IDialogContentStyles>; modal: Partial<IModalStyles> } = {
  content: css`
    height: 675px;
    padding-bottom: 4px;
  `,
  dialog: {
    title: {
      fontSize: FontSizes.size20,
      fontWeight: FontWeights.bold,
      paddingBottom: '11px',
      paddingTop: '14px',
    },
  },
  modal: {
    main: {
      height: '800px !important',
      maxWidth: '80% !important',
      width: '600px !important',
    },
  },
};

// -------------------- DisplayManifestModal -------------------- //

const dragOptions: IDragOptions = {
  moveMenuItemText: formatMessage('Move'),
  closeMenuItemText: formatMessage('Close'),
  menu: ContextualMenu,
};

interface DisplayManifestModalProps {
  isDraggable?: boolean;
  isModeless?: boolean;
  skillNameIdentifier?: string | null;
  onDismiss: () => void;
  projectId: string;
}

export const DisplayManifestModal: React.FC<DisplayManifestModalProps> = ({
  isDraggable = true,
  isModeless = true,
  projectId,
  onDismiss,
}) => {
  const skills = useRecoilValue(skillsStateSelector);
  const userSettings = useRecoilValue(userSettingsState);
  const skillsByProjectId = useRecoilValue(skillNameIdentifierByProjectIdSelector);
  const skillNameIdentifier = skillsByProjectId[projectId];
  useEffect(() => onDismiss, []);

  const selectedSkill = useMemo(() => {
    if (skillNameIdentifier) {
      return skills[skillNameIdentifier];
    }
  }, [skillNameIdentifier, skills]);

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
          value={selectedSkill.manifest}
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
