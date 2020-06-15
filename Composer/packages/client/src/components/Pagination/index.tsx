// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { useState, useEffect } from 'react';
import formatMessage from 'format-message';
import range from 'lodash/range';

import { container, dropdownStyles, text } from './style';

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

  return (
    <div aria-label={formatMessage('navigation control')} css={container} role="region">
      <DefaultButton allowDisabledFocus disabled={index === 0} text="< Previous" onClick={handlePreviousClick} />
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
      <DefaultButton allowDisabledFocus disabled={index === pageCount - 1} text="Next >" onClick={handleNextClick} />
    </div>
  );
};
