/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { PropTypes } from 'prop-types';

import { navLinkClass, newStorageButton } from './styles';

export function StorageSelector(props) {
  const { storages, currentStorageId, onStorageSourceChange, onAddNew } = props;

  const getNavItems = () => {
    const links = storages.map((storage, index) => {
      return {
        name: storage.name,
        key: storage.id,
        onClick: () => onStorageSourceChange(index),
      };
    });

    return [
      {
        links: links,
      },
    ];
  };

  return (
    <div
      style={{
        paddingTop: '10px',
      }}
    >
      <Nav
        groups={getNavItems()}
        selectedKey={currentStorageId}
        styles={{
          link: navLinkClass.storageNav,
          groupContent: navLinkClass.groupContent,
          navItems: navLinkClass.navItems,
        }}
      />
      <IconButton css={newStorageButton} iconProps={{ iconName: 'Add' }} onClick={onAddNew} />
    </div>
  );
}

StorageSelector.propTypes = {
  storages: PropTypes.array,
  actionName: PropTypes.string,
  currentStorageId: PropTypes.string,
  onStorageSourceChange: PropTypes.func,
  onAddNew: PropTypes.func,
};
