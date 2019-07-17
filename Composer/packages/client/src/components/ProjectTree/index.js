/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { PropTypes } from 'prop-types';
import { Nav, Link } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { nav, addButton } from './styles';
import { TreeItem } from './treeItem';

const onRenderLink = (link, render) => {
  return <TreeItem link={link} render={render} />;
};

export const ProjectTree = props => {
  const { files, onSelect, activeNode, onAdd, onDelete } = props;

  const links = useMemo(() => {
    const links = files.reduce((result, file) => {
      if (result.length === 0) {
        result = [{ links: [] }];
      }
      const item = { key: file.id, ...file, forceAnchor: true, onDelete: onDelete };

      item.name = file.displayName;

      if (file.isRoot) {
        result[0] = { ...result[0], ...item, isExpanded: true, hiddenMore: true };
      } else {
        result[0].links.push(item);
      }
      return result;
    }, []);
    return links;
  }, [files]);

  return (
    <div>
      <Nav
        onLinkClick={(ev, item) => {
          onSelect(item.id);
          ev.preventDefault();
        }}
        onLinkExpandClick={(ev, item) => {
          onSelect(item.id);
        }}
        groups={[{ links: links }]}
        selectedKey={activeNode}
        styles={nav}
        onRenderLink={onRenderLink}
      />
      <Link css={addButton} onClick={onAdd}>
        {formatMessage('Add ..')}
      </Link>
    </div>
  );
};

ProjectTree.propTypes = {
  files: PropTypes.array,
  activeNode: PropTypes.string,
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
};
