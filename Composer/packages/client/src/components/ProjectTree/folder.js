/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { PropTypes } from 'prop-types';

import { folderItem } from './styles';

export const Folder = props => {
  const { opened, folder, onFolderClick, onFolderRightClick } = props;
  let iconName = opened ? 'FabricOpenFolderHorizontal' : 'FabricFolder';

  if (folder.scheme === 'file') {
    iconName = 'TextDocument';
  }

  return (
    <div css={folderItem}>
      <Icon iconName={iconName} className="ms-IconExample" />
      <span onClick={() => onFolderClick(folder)} onContextMenu={onFolderRightClick}>
        {folder.name}
      </span>
    </div>
  );
};

Folder.propTypes = {
  opened: PropTypes.bool,
  folder: PropTypes.object,
  onFolderClick: PropTypes.func,
  onFolderRightClick: PropTypes.func,
};
