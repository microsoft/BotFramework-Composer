/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Breadcrumb } from 'office-ui-fabric-react/lib/Breadcrumb';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Fragment } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';

import DetailsList from '../DetailList';

import { container, body, navHeader, navBody, panelNav, panelContent, iconContainer, icon } from './styles';

function togglePanel(props) {
  props.setPanelStatus(!props.panelStatus);
}

function onItemClicked(ev, item) {
  // todo: implement the state change.
  // eslint-disable-next-line no-console
  console.log(`Breadcrumb item with key "${item.key}" has been clicked.`);
}

function onNavClicked(ev, item, props) {
  props.setSourceIndex(item.key);
}

function getCustomDivider() {
  return <span style={{ cursor: 'pointer' }}>/</span>;
}

// this empty div tag used to replace the default panel header.
function onRenderNavigationContent() {
  return (
    <Fragment>
      <div style={{ height: '0px' }} />
    </Fragment>
  );
}

export const OpenBot = props => (
  <Fragment>
    <Panel
      isOpen={props.panelStatus}
      type={PanelType.customNear}
      css={container}
      isModeless={true}
      isBlocking={false}
      hasCloseButton={false}
      onRenderNavigation={onRenderNavigationContent}
    >
      <div css={body}>
        <div css={panelNav}>
          <div css={navHeader} onClick={() => togglePanel(props)}>
            <div css={iconContainer}>
              <Icon iconName="Back" css={icon} text="Close" />
            </div>
          </div>
          <div>
            <Nav
              groups={[
                {
                  links: [{ name: 'Open', key: '1', onClick: onItemClicked }],
                },
              ]}
              css={navBody}
              styles={{
                link: {
                  displayName: 'testStyle',
                  backgroundColor: '#2b579a',
                  color: 'white',
                  fontSize: '16px',
                  selectors: {
                    '&:hover': {
                      displayName: 'testHover',
                      color: 'white !important',
                      fontSize: '16px',
                      backgroundColor: '#366ec2 !important',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div css={panelContent}>
          <div style={{ paddingTop: '7px' }}>
            <Nav
              groups={[
                {
                  links: [
                    { name: 'Recent', key: '0', onClick: (ev, items) => onNavClicked(ev, items, props) },
                    { name: 'This PC', key: '1', onClick: (ev, items) => onNavClicked(ev, items, props) },
                    // { name: 'OneDrive', key: '2', onClick: (ev, items) => onNavClicked(ev, items, props) },
                  ],
                },
              ]}
              initialSelectedKey={'0'}
              css={navBody}
              styles={{
                link: {
                  color: 'black',
                  fontSize: '16px',
                  width: '200px',
                },
              }}
            />
          </div>
          <div style={{ width: '100%' }}>
            <Breadcrumb
              items={[
                { text: 'Files', key: 'Files', onClick: onItemClicked },
                { text: 'This is folder 1', key: 'f1', onClick: onItemClicked },
                { text: 'This is folder 2', key: 'f2', onClick: onItemClicked },
                { text: 'This is folder 3', key: 'f3', onClick: onItemClicked },
                { text: 'This is folder 4', key: 'f4', onClick: onItemClicked },
                { text: 'This is folder 5', key: 'f5', onClick: onItemClicked, isCurrentItem: true },
              ]}
              dividerAs={getCustomDivider}
              ariaLabel={'File path'}
            />
            <DetailsList items={props.items} columns={props.columns} />
          </div>
        </div>
      </div>
    </Panel>
  </Fragment>
);

OpenBot.propTypes = {
  panelStatus: PropTypes.bool,
  setPanelStatus: PropTypes.func,
  items: PropTypes.array,
  columns: PropTypes.array,
  setSourceIndex: PropTypes.func,
};
