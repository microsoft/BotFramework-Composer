/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';
import startCase from 'lodash.startcase';

import { folderItem } from './styles';

export const Folder = props => {
  const { activeNode, folder, onFolderClick, onFolderRightClick } = props;

  return (
    <div css={folderItem(activeNode === folder.id)}>
      <span onClick={() => onFolderClick(folder)} onContextMenu={onFolderRightClick}>
        {formatMessage(startCase(folder.name).replace(/\s/g, ''))}
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
