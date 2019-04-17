/* eslint-disable react/display-name */
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { navHeader, leftNav, closeIcon, navLinkClass } from './styles';

export function ActionSelector(props) {
  const { links, onCloseExplorer, onLinkClick, selectedKey } = props;

  return (
    <div css={leftNav}>
      <div css={navHeader} onClick={onCloseExplorer}>
        <Icon iconName="Back" css={closeIcon} text={formatMessage('Close')} />
      </div>
      <div>
        <Nav
          groups={[{ links: links }]}
          selectedKey={selectedKey}
          onLinkClick={onLinkClick}
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
  links: PropTypes.string,
  onLinkClick: PropTypes.func,
  selectedKey: PropTypes.array,
  onCloseExplorer: PropTypes.func,
};
