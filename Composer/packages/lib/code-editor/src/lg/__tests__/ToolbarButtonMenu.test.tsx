// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as crypto from 'crypto';

import { builtInFunctionsGrouping, getBuiltInFunctionInsertText } from '@bfc/built-in-functions';
import { act, fireEvent, render, screen } from '@botframework-composer/test-utils';
import React from 'react';

import { ToolbarButtonMenu } from '../ToolbarButtonMenu';
import { FunctionRefPayload, PropertyRefPayload, TemplateRefPayload } from '../types';

(global as any).crypto = {
  getRandomValues: (arr: any[]) => crypto.randomBytes(arr.length),
};

jest.useFakeTimers();

const templatePayload: TemplateRefPayload = {
  kind: 'template',
  data: {
    onSelectTemplate: jest.fn(),
    templates: new Array(5)
      .fill(null)
      .map((_, idx) => ({ name: `t-${idx}${idx % 2 === 0 ? '-keyword' : ''}`, body: `- t-${idx}`, parameters: [] })),
  },
};

const propertiesPayload: PropertyRefPayload = {
  kind: 'property',
  data: {
    properties: ['this.test1', 'this.test2', 'turn.test1', 'turn.test2', 'turn.test2.test3'],
    onSelectProperty: jest.fn(),
  },
};

const allFunctions = builtInFunctionsGrouping.reduce((funcs, item) => {
  funcs.push(...item.children);
  return funcs;
}, [] as string[]);

const functionPayload: FunctionRefPayload = {
  kind: 'function',
  data: { functions: builtInFunctionsGrouping, onSelectFunction: jest.fn() },
};

describe('<ToolbarButtonMenu />', () => {
  /**
   * -------------------------------------------------
   * --------------------Templates--------------------
   * -------------------------------------------------
   */
  it('template: Should render icon button with templates in the menu when passed template payload', async () => {
    const component = render(<ToolbarButtonMenu payload={templatePayload} />);

    expect(component).toBeTruthy();

    fireEvent.click(screen.getByTestId('menuButton'));

    expect((await screen.findAllByText(/t-/)).length).toBe(5);
  });

  it('template: Should filter templates when passed query', async () => {
    render(<ToolbarButtonMenu payload={templatePayload} />);

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.change(screen.getByPlaceholderText('Search templates'), { target: { value: 'keyword' } });

    act(() => {
      jest.runAllTimers();
    });

    expect((await screen.findAllByText(/t-/)).length).toBe(3);
  });

  it('template: Should call onSelectCallback when a template is selected', async () => {
    const component = render(<ToolbarButtonMenu payload={templatePayload} />);

    expect(component).toBeTruthy();

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText('#t-1'));

    expect(templatePayload.data.onSelectTemplate).toBeCalledWith('t-1()', 'template');
  });

  /**
   * -------------------------------------------------
   * --------------------Properties-------------------
   * -------------------------------------------------
   */

  it('property: Should render icon button with properties in menu when passed property payload', async () => {
    const component = render(<ToolbarButtonMenu payload={propertiesPayload} />);

    expect(component).toBeTruthy();

    fireEvent.click(screen.getByTestId('menuButton'));

    expect(screen.getByText(/this/)).toBeTruthy();
    expect(screen.getByText(/turn/)).toBeTruthy();
  });

  it('property: Should filter properties when passed query', async () => {
    render(<ToolbarButtonMenu payload={propertiesPayload} />);

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.change(screen.getByPlaceholderText('Search properties'), { target: { value: 'test1' } });

    act(() => {
      jest.runAllTimers();
    });

    expect((await screen.findAllByText(/test1/)).length).toBe(2);
  });

  it('property: Should expand property in the menu on click if not leaf', async () => {
    render(<ToolbarButtonMenu payload={propertiesPayload} />);

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText('this.'));

    expect((await screen.findAllByText(/test/)).length).toBe(2);
  });

  it('property: Should call onSelectCallback when a leaf property is selected', async () => {
    const component = render(<ToolbarButtonMenu payload={propertiesPayload} />);

    expect(component).toBeTruthy();

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText('turn.'));
    fireEvent.click(screen.getByText('test1'));

    expect(propertiesPayload.data.onSelectProperty).toBeCalledWith('turn.test1', 'property');
  });

  /**
   * -------------------------------------------------
   * --------------------Functions--------------------
   * -------------------------------------------------
   */

  it('function: Should render icon button with functions in menu when passed function payload', async () => {
    const component = render(<ToolbarButtonMenu payload={functionPayload} />);

    expect(component).toBeTruthy();

    fireEvent.click(screen.getByTestId('menuButton'));

    builtInFunctionsGrouping.forEach((item) => {
      expect(screen.getByText(item.name)).toBeTruthy();
    });
  });

  it('function: Should show sub-menu when category is clicked from menu', async () => {
    render(<ToolbarButtonMenu payload={functionPayload} />);

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText(builtInFunctionsGrouping[0].name));

    builtInFunctionsGrouping[0].children.forEach((functionName) => {
      expect(screen.getByText(functionName)).toBeTruthy();
    });
  });

  it('function: Should filter functions when passed query', async () => {
    render(<ToolbarButtonMenu payload={functionPayload} />);

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.change(screen.getByPlaceholderText('Search functions'), { target: { value: 'string' } });

    act(() => {
      jest.runAllTimers();
    });

    const filteredFunctions = allFunctions.filter((item) => item.toLowerCase().includes('string'));

    filteredFunctions.forEach((functionName) => {
      expect(screen.getByText(functionName)).toBeTruthy();
    });
  });

  it('function: Should call onSelectCallback when a function is selected', async () => {
    const component = render(<ToolbarButtonMenu payload={functionPayload} />);

    expect(component).toBeTruthy();

    const categoryName = builtInFunctionsGrouping[0].name;
    const functionName = builtInFunctionsGrouping[0].children[0];

    fireEvent.click(screen.getByTestId('menuButton'));
    fireEvent.click(screen.getByText(categoryName));
    fireEvent.click(screen.getByText(functionName));

    expect(functionPayload.data.onSelectFunction).toBeCalledWith(
      getBuiltInFunctionInsertText(functionName),
      'function'
    );
  });
});
