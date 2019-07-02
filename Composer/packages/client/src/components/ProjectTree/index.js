/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { PropTypes } from 'prop-types';
import { Nav } from 'office-ui-fabric-react';

export const ProjectTree = props => {
  const { files, onSelect, activeNode } = props;

  const links = useMemo(() => {
    return files.reduce((result, file) => {
      if (result.length === 0) {
        result = [{ links: [] }];
      }
      const item = {
        key: file.id,
        ...file,
      };

      item.name = file.displayName;

      if (file.id === 0) {
        result[0] = { ...result[0], ...item, isExpanded: true };
      } else {
        result[0].links.push(item);
      }
      return result;
    }, []);
  }, [files]);

  return (
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
    />
  );
};

ProjectTree.propTypes = {
  files: PropTypes.array,
  activeNode: PropTypes.number,
  onSelect: PropTypes.func,
};
