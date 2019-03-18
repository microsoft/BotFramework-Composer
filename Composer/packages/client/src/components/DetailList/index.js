/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useLayoutEffect } from 'react';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { PropTypes } from 'prop-types';

function DetailList(props) {
  function onItemInvoked(item) {
    alert(`Item invoked: ${item.name}`);
  }

  const [hasMounted, updateMounted] = useState(false);
  useLayoutEffect(() => {
    updateMounted(true);
  });

  const selection = new Selection({
    onSelectionChanged: () => {
      if (hasMounted) {
        onItemInvoked(selection.getSelection()[0]);
      }
    },
  });

  return (
    <DetailsList
      items={props.items}
      compact={false}
      columns={props.columns}
      setKey="set"
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
      selection={selection}
      selectionMode={SelectionMode.none}
      selectionPreservedOnEmptyClick={true}
      onItemInvoked={onItemInvoked}
      enterModalSelectionOnTouch={true}
    />
  );
}
export default DetailList;

DetailList.propTypes = {
  items: PropTypes.array,
  columns: PropTypes.array,
};
