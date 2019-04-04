/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';

import { Folder } from './folder';
import { childrenUl, nodeItem } from './styles';

export const Node = props => {
  const [opened, setOpened] = useState(false);
  const { node, files, activeNode, onSelect } = props;

  function handleRightClick(e) {
    e.preventDefault();
  }

  useEffect(() => {
    if (node.id === 0) {
      setTimeout(() => {
        onSelect(node.id);
      }, 0);
    }
  }, [node]);

  return (
    <li css={nodeItem(node.id)}>
      <Folder
        folder={node}
        activeNode={activeNode}
        opened={true}
        onFolderClick={node => {
          setOpened(!opened);
          onSelect(node.id);
        }}
        onFolderRightClick={handleRightClick}
      />
      <ul css={childrenUl(true)}>
        {files.map(item => {
          if (item.parent && item.parent === node.name)
            return <Node key={item.id} node={item} files={files} activeNode={activeNode} onSelect={onSelect} />;
        })}
      </ul>
    </li>
  );
};

Node.propTypes = {
  files: PropTypes.array,
  node: PropTypes.object,
  activeNode: PropTypes.number,
  onSelect: PropTypes.func,
};
