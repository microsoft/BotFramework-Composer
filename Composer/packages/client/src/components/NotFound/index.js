/** @jsx jsx */
import { jsx } from '@emotion/core';

import { notfoundbody, notfoundcontainer, description, notfoundicon } from './style';

export const NotFound = () => {
  return (
    <div css={notfoundbody}>
      <div css={notfoundcontainer}>
        <div>
          <div css={description}>{"The page you are looking for can't be found."}</div>
          <div css={notfoundicon}>{'404'}</div>
        </div>
      </div>
    </div>
  );
};
