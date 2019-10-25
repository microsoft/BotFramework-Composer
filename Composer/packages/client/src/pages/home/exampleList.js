/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { List } from 'office-ui-fabric-react/lib/List';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { PropTypes } from 'prop-types';
import { Fragment } from 'react';

import { exampleListContainer, exampleListClass } from './styles';

export function ExampleList(props) {
  const { onClick, examples } = props;

  function _onRenderCell(item, index) {
    return (
      <div
        className={exampleListClass.itemCell}
        data-is-focusable={true}
        index={item.id}
        onClick={() => onClick(item.id)}
      >
        <FontIcon iconName="Robot" className={exampleListClass.image} />
        <div className={exampleListClass.itemContent}>
          <div className={exampleListClass.itemName}>{item.name}</div>
          <div className={exampleListClass.itemIndex}>{item.description}</div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div data-is-scrollable="true" css={exampleListContainer}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <List items={examples} onRenderCell={_onRenderCell} />
        </ScrollablePane>
      </div>
    </Fragment>
  );
}

ExampleList.propTypes = {
  examples: PropTypes.array,
  onClick: PropTypes.func,
};
