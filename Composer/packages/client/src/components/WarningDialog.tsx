// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { provisionStatusState } from '../recoilModel';

interface WarningDialogProps {
  projectId: string;
  children: React.ReactNode;
}

export const WarningDialog: React.FC<WarningDialogProps> = (props) => {
  const projectId = props.projectId;
  const provisionStatus = useRecoilValue(provisionStatusState(projectId));

  const provisionListener = (e) => {
    console.log(provisionStatus);
    if (projectId && Object.keys(provisionStatus).length > 0) {
      e.preventDefault();
      e.returnValue = 'test';
    } else {
      e.returnValue = '';
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', provisionListener);
    return () => {
      window.removeEventListener('beforeunload', provisionListener);
    };
  }, [provisionListener]);

  return <Fragment>{props.children}</Fragment>;
};
