// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';

import { BASEPATH } from '../constants';

// -------------------- Styles -------------------- //

export const notfoundbody = css`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  vertical-align: middle;
`;

export const notfoundcontainer = css`
  height: 80%;
  display: flex;
  justify-content: center;
  vertical-align: middle;
  flex-direction: column;
  text-align: center;
`;

export const description = css`
  font-size: 34px;
`;

export const notfoundicon = css`
  font-size: 76px;
`;

// -------------------- NotFound -------------------- //

export const NotFound = (props) => {
  const { uri } = props;
  if (uri === BASEPATH) {
    return null;
  }

  return (
    <div css={notfoundbody}>
      <div css={notfoundcontainer}>
        <div>
          <div css={description}>{formatMessage('The page you are looking for can’t be found.')}</div>
          <div css={notfoundicon}>{'404'}</div>
        </div>
      </div>
    </div>
  );
};
