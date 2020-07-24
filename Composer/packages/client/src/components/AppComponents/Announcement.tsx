// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useRecoilValue } from 'recoil';

import { announcementState } from './../../recoilModel';

export const Announcement = () => {
  const announcement = useRecoilValue(announcementState);
  return (
    <div
      aria-live="assertive"
      role="alert"
      style={{
        display: 'block',
        position: 'absolute',
        top: '-9999px',
        height: '1px',
        width: '1px',
      }}
    >
      {announcement}
    </div>
  );
};
