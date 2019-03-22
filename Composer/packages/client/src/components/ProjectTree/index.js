/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';

import { Node } from './node';

export const ProjectTree = props => {
  const { files, activeNode, onSelect } = props;

  function buildProjectTree() {
    return files.map((node, key) => {
      return <Node key={key} node={node} activeNode={activeNode} onSelect={onSelect} />;
    });
  }

  return <ul>{files && files.length ? buildProjectTree() : 'loading...'}</ul>;
};

ProjectTree.propTypes = {
  files: PropTypes.array,
  activeNode: PropTypes.object,
  onSelect: PropTypes.func,
};
