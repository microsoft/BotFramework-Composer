// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useEffect, useRef, useState } from 'react';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import { IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { ISearchBox, ISearchBoxStyles, SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { useRecoilValue } from 'recoil';

import { PVADisableFeature } from '../PVADisableFeature';
import { usePVACheck } from '../../hooks/usePVACheck';
import { rootBotProjectIdSelector } from '../../recoilModel';

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

const commands = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
`;

export interface ProjectTreeHeaderMenuItem {
  icon?: string;
  label: string;
  onClick: () => void;
}

export interface ProjectTreeHeaderProps {
  menu: ProjectTreeHeaderMenuItem[];
  placeholder?: string;
  ariaLabel?: string;
  onFilter?: (newValue?: string) => void;
}

export const ProjectTreeHeader: React.FC<ProjectTreeHeaderProps> = ({
  menu,
  onFilter = () => {},
  placeholder = '',
  ariaLabel = '',
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const searchBoxRef = useRef<ISearchBox>(null);
  const rootBotId = useRecoilValue(rootBotProjectIdSelector) ?? '';
  const isPVABot = usePVACheck(rootBotId);

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
  }) as IOverflowSetItemProps[];

  const handleSearchBoxBlur = () => {
    onFilter('');
    setShowFilter(false);
  };

  const addCommandBtn = (
    <CommandButton
      data-is-focusable
      ariaLabel={formatMessage('Actions')}
      className="project-tree-header-more-btn"
      css={buttonStyle}
      data-testid="projectTreeHeaderMoreButton"
      disabled={isPVABot}
      iconProps={{ iconName: 'Add' }}
      menuProps={{ items: overflowMenu }}
      tabIndex={0}
      text={formatMessage('Add')}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
        }
      }}
    />
  );

  return (
    <div css={headerText}>
      {showFilter ? (
        <SearchBox
          underlined
          ariaLabel={ariaLabel}
          componentRef={searchBoxRef}
          iconProps={{ iconName: 'Filter' }}
          placeholder={placeholder}
          styles={searchBox}
          onBlur={handleSearchBoxBlur}
          onChange={(_e, value) => onFilter(value)}
        />
      ) : (
        <div css={commands}>
          {overflowMenu.length ? (
            isPVABot ? (
              <PVADisableFeature>{addCommandBtn}</PVADisableFeature>
            ) : (
              addCommandBtn
            )
          ) : null}
          <CommandButton
            ariaLabel={formatMessage('Filter')}
            css={buttonStyle}
            iconProps={{ iconName: 'Filter' }}
            tabIndex={0}
            onClick={() => {
              setShowFilter(true);
            }}
          />
        </div>
      )}
    </div>
  );
};
