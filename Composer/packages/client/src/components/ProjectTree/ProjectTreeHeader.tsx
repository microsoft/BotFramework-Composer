// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useEffect, useRef, useState } from 'react';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ISearchBox, ISearchBoxStyles, SearchBox } from 'office-ui-fabric-react/lib/SearchBox';

const searchBox: ISearchBoxStyles = {
  root: {
    borderBottom: `1px solid ${NeutralColors.gray30}`,
    height: '45px',
    borderRadius: '0px',
    width: '100%',
  },
};

const buttonStyle = css`
  height: 100%;
`;

const headerText = css`
  border-bottom: 1px solid ${NeutralColors.gray30};
  height: 45px;
  border-radius: 0px;
  text-align: left;
  font-size: ${FontSizes.size12};
  position: relative;
  display: flex;
  margin: 0;
`;

const overflowSet = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  display: flex;
`;

export interface ProjectTreeHeaderMenuItem {
  icon?: string;
  label: string;
  onClick: () => void;
}

export interface ProjectTreeHeaderProps {
  menu: ProjectTreeHeaderMenuItem[];
  onFilter?: (newValue?: string) => void;
}

const onRenderItem = (item: IOverflowSetItemProps): JSX.Element => {
  if (item.onRender) {
    return item.onRender(item);
  }
  return (
    <CommandButton
      css={buttonStyle}
      iconProps={{ iconName: item.icon }}
      menuProps={item.subMenuProps}
      role="menuitem"
      text={item.name}
      onClick={item.onClick}
    />
  );
};

const onRenderOverflowButton = (isActive: boolean) => {
  const moreLabel = formatMessage('Actions');
  return (overflowItems: IContextualMenuItem[] | undefined) => {
    if (!overflowItems) return null;
    return (
      <CommandButton
        ariaLabel={moreLabel}
        className="project-tree-header-more-btn"
        css={buttonStyle}
        data-is-focusable={isActive}
        data-testid="projectTreeHeaderMoreButton"
        iconProps={{ iconName: 'Add' }}
        menuProps={{ items: overflowItems }}
        text={formatMessage('Add')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
      />
    );
  };
};

export const ProjectTreeHeader: React.FC<ProjectTreeHeaderProps> = ({ menu, onFilter = () => {} }) => {
  const [showFilter, setShowFilter] = useState(false);
  const searchBoxRef = useRef<ISearchBox>(null);

  useEffect(() => {
    if (showFilter && searchBoxRef.current) {
      searchBoxRef.current.focus();
    }
  }, [showFilter]);

  const overflowMenu = menu.map((item) => {
    return {
      key: item.label,
      ariaLabel: item.label,
      text: item.label,
      style: { fontSize: FontSizes.size12 },
      iconProps: {
        iconName: item.icon,
        styles: { root: { fontSize: FontSizes.size12, display: item.icon ? 'inherit' : 'none' } },
      },
      onClick: item.onClick,
    };
  });

  const handleSearchBoxBlur = (_e) => {
    onFilter('');
    setShowFilter(false);
  };

  return (
    <div css={headerText}>
      {showFilter ? (
        <SearchBox
          underlined
          ariaLabel={formatMessage('Type trigger name')}
          componentRef={searchBoxRef}
          iconProps={{ iconName: 'Filter' }}
          placeholder={formatMessage('Filter by trigger name')}
          styles={searchBox}
          onBlur={handleSearchBoxBlur}
          onChange={(_e, value) => onFilter(value)}
        />
      ) : (
        <OverflowSet
          doNotContainWithinFocusZone
          css={overflowSet}
          data-testid={'ProjectTreeHeaderMoreButton'}
          items={[
            {
              key: 'newItem',
              icon: 'Filter',
              ariaLabel: formatMessage('Filter by trigger name'),
              onClick: () => {
                setShowFilter(true);
              },
            },
          ]}
          overflowItems={overflowMenu}
          overflowSide={'start'}
          role="row"
          styles={{ item: { flex: 1, justifyContent: 'flex-end' } }}
          onRenderItem={onRenderItem}
          onRenderOverflowButton={onRenderOverflowButton(true)}
        />
      )}
    </div>
  );
};
