/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { PropTypes } from 'prop-types';
import { Nav, Link } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { nav, addButton } from './styles';

export const ProjectTree = props => {
  const { files, onSelect, activeNode, onAdd } = props;

  const links = useMemo(() => {
    const links = files.reduce((result, file) => {
      if (result.length === 0) {
        result = [
          {
            links: [],
          },
        ];
      }
      const item = {
        key: file.id,
        ...file,
      };

      item.name = file.displayName;

      if (file.isRoot) {
        result[0] = { ...result[0], ...item, isExpanded: true };
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
          if (item.key !== 'newDialog') {
            onSelect(item.id || files[0].id);
          } else {
            onAdd();
          }
          ev.preventDefault();
        }}
        onLinkExpandClick={(ev, item) => {
          onSelect(item.id || files[0].id);
        }}
        groups={[
          {
            links: links,
            collapseByDefault: true,
          },
        ]}
        selectedKey={activeNode}
        styles={nav}
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
};
