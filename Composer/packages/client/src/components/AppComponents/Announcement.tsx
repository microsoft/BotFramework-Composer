// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';

import { announcementState } from './../../recoilModel';

export const Announcement = () => {
  const style = css`
    display: block;
    position: absolute;
    top: -9999px;
    height: 1px;
    width: 1px;
  `;

  const announcement = useRecoilValue(announcementState);
  return (
    <div aria-live="assertive" css={style} role="alert">
      {announcement}
    </div>
  );
};
