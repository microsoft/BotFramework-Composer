// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';

import { LoadingSpinner } from '../../../components/LoadingSpinner';

import { modalControlGroup } from './style';

export interface WorkingModalProps {
  hidden: boolean;
  title: string;
}
export const WorkingModal: React.FC<WorkingModalProps> = (props) => {
  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: props.title,
      }}
      hidden={props.hidden}
      modalProps={{
        isBlocking: false,
      }}
    >
      <div css={modalControlGroup}>
        <LoadingSpinner />
      </div>
    </Dialog>
  );
};
