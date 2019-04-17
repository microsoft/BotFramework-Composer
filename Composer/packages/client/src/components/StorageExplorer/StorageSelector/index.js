/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { PropTypes } from 'prop-types';

import { navLinkClass, title } from './styles';

export function StorageSelector(props) {
  const { storages, actionName, currentStorageId, onStorageSourceChange } = props;
  // todo: result parse from api result to ui acceptable format may need move to reducer.
  const links = storages.map((storage, index) => {
    return {
      name: storage.name,
      key: storage.id,
      onClick: () => onStorageSourceChange(index),
    };
  });

  const storageNavItems = [
    {
      links: links,
    },
  ];

  return (
    <div>
      <div css={title}>{actionName}</div>
      <div style={{ paddingTop: '10px' }}>
        <Nav
          groups={storageNavItems}
          initialSelectedKey={currentStorageId}
          styles={{
            link: navLinkClass.storageNav,
          }}
        />
      </div>
    </div>
  );
}

StorageSelector.propTypes = {
  storages: PropTypes.array,
  actionName: PropTypes.string,
  currentStorageId: PropTypes.string,
  onStorageSourceChange: PropTypes.func,
};
