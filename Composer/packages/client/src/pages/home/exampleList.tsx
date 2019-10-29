/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { List } from 'office-ui-fabric-react/lib/List';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Fragment } from 'react';

import { exampleListContainer, exampleListClass } from './styles';

interface ExampleListProps {
  examples: any;
  onClick: (templateId: string) => void;
}

export const ExampleList: React.FC<ExampleListProps> = props => {
  const { onClick, examples } = props;

  function _onRenderCell(item?: any, index?: number): React.ReactNode {
    return (
      <div
        className={exampleListClass.itemCell}
        data-is-focusable={true}
        key={item.id}
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
};
