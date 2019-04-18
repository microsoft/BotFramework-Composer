/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { folderItem } from './styles';

export const Folder = props => {
  const { activeNode, folder, onFolderClick, onFolderRightClick } = props;

  function splitFileName(text) {
    const pattern = /\.{1}[a-zA-Z]{1,}$/;
    let temp = text;
    if (pattern.exec(text) !== null) {
      temp = text.slice(0, pattern.exec(text).index);
    }

    return temp.charAt(0).toUpperCase() + temp.slice(1);
  }

  return (
    <div css={folderItem(activeNode === folder.id)}>
      <span onClick={() => onFolderClick(folder)} onContextMenu={onFolderRightClick}>
        {splitFileName(folder.name)}
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
