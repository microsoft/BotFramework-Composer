// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { FontSizes, NeutralColors } from '@fluentui/theme';
import formatMessage from 'format-message';
import { CommandButton, IButton } from '@fluentui/react/lib/Button';
import { ISearchBox, ISearchBoxStyles, SearchBox } from '@fluentui/react/lib/SearchBox';
import { usePrevious } from '@fluentui/react-hooks';

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
  filterValue: string;
}

export const ProjectTreeHeader: React.FC<ProjectTreeHeaderProps> = ({
  filterValue,
  onFilter = () => {},
  placeholder = '',
  ariaLabel = '',
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const searchBoxRef = useRef<ISearchBox>(null);

  useEffect(() => {
    if (showFilter && searchBoxRef.current) {
      searchBoxRef.current.focus();
    }
  }, [showFilter]);

  const handleSearchBoxBlur = () => {
    if (!filterValue) {
      onFilter('');
      setShowFilter(false);
    }
  };

  // Move focus back to the filter button after the filter search box gets closed
  const filterButtonRef = useRef<IButton>(null);
  const prevShowFilter = usePrevious(showFilter);
  useEffect(() => {
    if (prevShowFilter && prevShowFilter !== showFilter) {
      setTimeout(() => {
        if (filterButtonRef.current) filterButtonRef.current.focus();
      });
    }
  }, [prevShowFilter, showFilter]);

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
          onClear={handleSearchBoxBlur}
        />
      ) : (
        <div css={commands}>
          <CommandButton
            ariaLabel={formatMessage('Filter')}
            componentRef={filterButtonRef}
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
