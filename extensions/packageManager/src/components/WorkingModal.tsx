// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import { LoadingSpinner } from '@bfc/ui-shared';
import { useApplicationApi } from '@bfc/extension-client';

import { modalControlGroup } from './styles';

export interface WorkingModalProps {
  hidden: boolean;
  title: string;
}
export const WorkingModal: React.FC<WorkingModalProps> = (props) => {
  const { announce } = useApplicationApi();

  useEffect(() => {
    announce(props.title);
  }, [props.title]);

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
      }}
      hidden={props.hidden}
      modalProps={{
        isBlocking: false,
      }}
    >
      <div css={modalControlGroup}>
        <LoadingSpinner message={props.title} />
      </div>
    </Dialog>
  );
};
