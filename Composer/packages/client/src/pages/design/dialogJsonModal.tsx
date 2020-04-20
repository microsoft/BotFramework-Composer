// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import Modal from 'office-ui-fabric-react/lib/Modal';
import { JsonEditor } from '@bfc/code-editor';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { ManifestModalBodyStyle, ManifestModalHeaderStyle } from './styles';

export const DialogJsonModal = props => {
  const { name, data, isOpen, onDismiss } = props;

  return (
    <Modal titleAriaId={'skillManifestModal'} isOpen={isOpen} onDismiss={onDismiss} isBlocking={false}>
      <div>
        <span css={ManifestModalHeaderStyle} id={'skillManifestModalHeader'}>
          {name}
        </span>
        <IconButton
          style={{ float: 'right' }}
          iconProps={{ iconName: 'Cancel' }}
          ariaLabel={formatMessage('Close popup modal')}
          onClick={onDismiss}
        />
      </div>
      <div css={ManifestModalBodyStyle}>
        <JsonEditor
          key={'testkey'}
          id={'modaljsonview'}
          onChange={() => {}}
          value={data || ''}
          height={800}
          width={800}
          options={{ readOnly: true }}
        />
      </div>
    </Modal>
  );
};
