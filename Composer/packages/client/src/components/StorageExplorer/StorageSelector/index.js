/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';

import { navLinkClass } from './styles';

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

    links.push({ name: 'New Storage', key: 'New Storage', icon: 'Add', onClick: onAddNew });

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
        }}
      />
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
