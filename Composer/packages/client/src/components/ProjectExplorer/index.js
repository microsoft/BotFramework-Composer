import { Fragment } from 'react';
import PropTypes from 'prop-types';
/** @jsx jsx */
import { jsx } from '@emotion/core';

import { ul } from './styles';

export const ProjectExplorer = props => (
  <Fragment>
    <div>Project Explorer </div>
    <ul css={ul}>
      {props.files.length > 0 &&
        props.files.map((item, index) => {
          return (
            <li
              key={item.name}
              onClick={() => {
                props.onClick(item, index);
              }}
            >
              {item.name}
            </li>
          );
        })}
    </ul>
  </Fragment>
);

ProjectExplorer.propTypes = {
  files: PropTypes.array,
  onClick: PropTypes.func,
};
