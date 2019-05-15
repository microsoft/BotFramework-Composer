/* eslint-disable react/display-name */
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { navHeader, leftNav, closeIcon, navLinkClass } from './styles';
import { OpenStatus } from './../../../constants';

const links = [
  {
    name: formatMessage('New'),
    key: OpenStatus.NEW,
  },
  {
    name: formatMessage('Open'),
    key: OpenStatus.OPEN,
  },
  {
    name: formatMessage('Save As'),
    key: OpenStatus.SAVEAS,
  },
];

export function ActionSelector(props) {
  const { onCloseExplorer, onLinkClick, selectedKey } = props;

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
  links: PropTypes.array,
  onLinkClick: PropTypes.func,
  selectedKey: PropTypes.string,
  onCloseExplorer: PropTypes.func,
};
