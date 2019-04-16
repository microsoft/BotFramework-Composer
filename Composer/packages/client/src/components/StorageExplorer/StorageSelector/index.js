/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';

import { navLinkClass, title } from './styles';

export function StorageSelector(props) {
  return (
    <div>
      <div css={title}>{props.actionName}</div>
      <div style={{ paddingTop: '10px' }}>
        <Nav
          groups={props.storageNavItems}
          initialSelectedKey={props.currentStorageId}
          styles={{
            link: navLinkClass.storageNav,
          }}
        />
      </div>
    </div>
  );
}

StorageSelector.propTypes = {
  storageNavItems: PropTypes.array,
  actionName: PropTypes.string,
  currentStorageId: PropTypes.string,
};
