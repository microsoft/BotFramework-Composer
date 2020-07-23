// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { useState, useEffect } from 'react';
import formatMessage from 'format-message';
import range from 'lodash/range';
import { IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';

// -------------------- Styles -------------------- //

export const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 80 },
};

export const container = css`
  display: flex;
  width: 400px;
  height: 45px;
  padding-top: 5px;
  line-height: 30px;
  background-color: transparent;
  justify-content: space-around;
`;

export const text = css`
  font-size: 12px;
  cursor: default;
`;

// -------------------- Pagination -------------------- //

export interface IPaginationProps {
  pageCount: number;
  onChange: (page: number) => void;
}

const createDropdownOption = (pageCount: number) => {
  return range(pageCount).map((_, i) => ({
    key: `page ${i}`,
    text: `${i}`,
  }));
};

export const Pagination: React.FC<IPaginationProps> = (props) => {
  const [index, setIndex] = useState(0);
  const { pageCount, onChange } = props;

  useEffect(() => {
    setIndex(0);
  }, [pageCount]);

  const changePage = (page: number) => {
    setIndex(page);
    onChange(page + 1);
  };

  const handlePageSelected = (event: React.FormEvent<HTMLDivElement>, item?: IDropdownOption, index?: number) => {
    if (index == null) return;
    changePage(index);
  };

  const handlePreviousClick = () => {
    changePage(index - 1);
  };

  const handleNextClick = () => {
    changePage(index + 1);
  };

  // Note: the labels will need to be made RTL-aware at some point
  return (
    <div aria-label={formatMessage('navigation control')} css={container} role="region">
      <DefaultButton
        allowDisabledFocus
        disabled={index === 0}
        iconProps={{
          iconName: 'ChevronLeft',
        }}
        text={formatMessage('Previous')}
        onClick={handlePreviousClick}
      />
      <span css={text}>Page</span>
      <Dropdown
        ariaLabel={formatMessage('Page number')}
        options={createDropdownOption(pageCount)}
        placeholder={formatMessage('Select options')}
        selectedKey={`page${index + 1}`}
        styles={dropdownStyles}
        onChange={handlePageSelected}
      />
      <span css={text}>of {pageCount}</span>
      <DefaultButton
        allowDisabledFocus
        disabled={index === pageCount - 1}
        iconProps={{
          iconName: 'ChevronRight',
        }}
        text={formatMessage('Next')}
        onClick={handleNextClick}
      />
    </div>
  );
};
