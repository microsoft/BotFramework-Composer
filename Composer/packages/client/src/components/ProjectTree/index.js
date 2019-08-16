/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useState } from 'react';
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

  const [filter, setFilter] = useState('');

  const links = useMemo(() => {
    const links = files
      .filter(file => {
        return file.displayName.toLowerCase().indexOf(filter) === 0;
      })
      .sort((a, b) => {
        if (a.isRoot) {
          return -1;
        } else if (b.isRoot) {
          return 1;
        } else {
          return 0;
        }
      })
      .reduce((result, file) => {
        const item = { key: file.id, ...file, forceAnchor: true, onDelete: onDelete };

        item.name = file.displayName;
        result.push({ ...item, isExpanded: false, hiddenMore: true });

        return result;
      }, []);
    return links;
  }, [files, filter]);

  const updateFilter = event => {
    const filter = event.target.value.toLowerCase();
    setFilter(filter);
  };

  return (
    <div>
      <input
        css={{ width: 'calc(100% - 1rem)', margin: '0.5rem auto', display: 'block' }}
        type="search"
        placeholder="filter"
        onKeyUp={updateFilter}
        onChange={updateFilter}
      />
      <Nav
        onLinkClick={(ev, item) => {
          onSelect(item.id || files[0].id);
          ev.preventDefault();
        }}
        onLinkExpandClick={(ev, item) => {
          onSelect(item.id || files[0].id);
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
