/* eslint-disable react/display-name */
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { useContext } from 'react';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { Store } from '../../../store/index';

import { navHeader, leftNav, closeIcon, navLinkClass } from './styles';

export function ActionSelector(props) {
  const { actions } = useContext(Store);

  function toggleExplorer() {
    status === 'closed' ? 'opened' : 'closed';
    actions.setStorageExplorerStatus(status);
  }

  return (
    <div css={leftNav}>
      <div css={navHeader} onClick={() => toggleExplorer()}>
        <Icon iconName="Back" css={closeIcon} text={formatMessage('Close')} />
      </div>
      <div>
        <Nav
          groups={props.groups}
          initialSelectedKey={'open'}
          styles={{
            link: navLinkClass.actionNav,
            linkText: navLinkClass.linkText,
          }}
        />
      </div>
    </div>
  );
}

ActionSelector.propTypes = {
  groups: PropTypes.array,
};
