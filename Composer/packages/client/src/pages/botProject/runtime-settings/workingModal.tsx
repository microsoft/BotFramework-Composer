// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { DialogWrapper, DialogTypes } from '../../../components/DialogWrapper';

import { modalControlGroup } from './style';

export type WorkingModalProps = {
  isOpen: boolean;
  title: string;
};
export const WorkingModal: React.FC<WorkingModalProps> = (props) => {
  return (
    <DialogWrapper dialogType={DialogTypes.Customer} isOpen={props.isOpen} title={props.title}>
      <div css={modalControlGroup}>
        <LoadingSpinner />
      </div>
    </DialogWrapper>
  );
};
