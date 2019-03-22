/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { PropTypes } from 'prop-types';

import { Folder } from './folder';
import { openul, closeul, nodeItem } from './styles';

export const Node = props => {
  const [opened, setOpened] = useState(false);
  const { node, activeNode, onSelect } = props;

  function handleRightClick(e) {
    e.preventDefault();
  }

  return (
    <li css={nodeItem}>
      <Folder
        folder={node}
        opened={opened}
        onFolderClick={node => {
          setOpened(!opened);
          onSelect(node);
        }}
        onFolderRightClick={handleRightClick}
      />
      {node.scheme == 'folder' && (
        <ul css={opened ? openul : closeul}>
          {node.children.map((child, key) => {
            return <Node key={key} node={child} activeNode={activeNode} onSelect={onSelect} />;
          })}
        </ul>
      )}
    </li>
  );
};

Node.propTypes = {
  node: PropTypes.object,
  activeNode: PropTypes.object,
  onSelect: PropTypes.func,
};
