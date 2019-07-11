/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import { BASEPATH } from '../../constants';

import { notfoundbody, notfoundcontainer, description, notfoundicon } from './style';

export const NotFound = props => {
  const { uri } = props;
  if (uri === BASEPATH) {
    return null;
  }

  return (
    <div css={notfoundbody}>
      <div css={notfoundcontainer}>
        <div>
          <div css={description}>{formatMessage("The page you are looking for can't be found.")}</div>
          <div css={notfoundicon}>{'404'}</div>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
