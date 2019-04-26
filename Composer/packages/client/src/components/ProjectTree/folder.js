/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { folderItem } from './styles';
import { upperCaseName } from './../../utils/fileUtil';

export const Folder = props => {
  const { activeNode, folder, onFolderClick, onFolderRightClick } = props;

  return (
    <div css={folderItem(activeNode === folder.id)}>
      <span onClick={() => onFolderClick(folder)} onContextMenu={onFolderRightClick}>
        {formatMessage(upperCaseName(folder.name))}
      </span>
    </div>
  );
};

Folder.propTypes = {
  folder: PropTypes.object,
  activeNode: PropTypes.number,
  onFolderClick: PropTypes.func,
  onFolderRightClick: PropTypes.func,
};
