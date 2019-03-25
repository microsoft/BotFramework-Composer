/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { Node } from './node';
import { container } from './styles';

export const ProjectTree = props => {
  const { files, activeNode, onSelect } = props;

  function buildProjectTree() {
    return files.map(node => {
      if (!node.parent)
        return <Node key={node.id} node={node} files={files} activeNode={activeNode} onSelect={onSelect} />;
    });
  }

  return <ul css={container}>{files && files.length ? buildProjectTree() : 'loading...'}</ul>;
};

ProjectTree.propTypes = {
  files: PropTypes.array,
  activeNode: PropTypes.number,
  onSelect: PropTypes.func,
};
