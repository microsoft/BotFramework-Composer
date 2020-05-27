// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { useState, useEffect } from 'react';
import formatMessage from 'format-message';

import { container, dropdownStyles, text } from './style';

export interface IPaginationProps {
  pageCount: number;
  onChange: (page: number) => void;
}

const createDropdownOption = (pageCount: number) => {
  const options: IDropdownOption[] = [];
  for (let i = 1; i <= pageCount; i++) {
    options.push({ key: 'page' + i, text: '' + i });
  }
  return options;
};

export const Pagination: React.FC<IPaginationProps> = (props) => {
  const [index, setIndex] = useState(0);
  const { pageCount, onChange } = props;

  useEffect(() => {
    setIndex(0);
  }, [pageCount]);

  const handlePageSelected = (event: React.FormEvent<HTMLDivElement>, item?: IDropdownOption, index?: number) => {
    setIndex(index || 0);
    onChange(index ? index + 1 : 1);
  };

  const hanglePreviousClick = () => {
    const current = index - 1;
    setIndex(current);
    onChange(current + 1);
  };

  const hangleNextClick = () => {
    const current = index + 1;
    setIndex(current);
    onChange(current + 1);
  };

  return (
    <div css={container}>
      <DefaultButton allowDisabledFocus disabled={index === 0} text="< Previous" onClick={hanglePreviousClick} />
      <span css={text}>Page</span>
      <Dropdown
        ariaLabel={formatMessage('Page number')}
        options={createDropdownOption(pageCount)}
        placeholder="Select options"
        selectedKey={`page${index + 1}`}
        styles={dropdownStyles}
        onChange={handlePageSelected}
      />
      <span css={text}>of {pageCount}</span>
      <DefaultButton allowDisabledFocus disabled={index === pageCount - 1} text="Next >" onClick={hangleNextClick} />
    </div>
  );
};
