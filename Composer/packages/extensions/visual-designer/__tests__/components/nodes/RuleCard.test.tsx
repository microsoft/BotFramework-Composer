// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, RenderResult } from '@bfc/test-utils/lib/react';

import { RuleCard } from '../../../src/components/nodes/templates/RuleCard';
import { NodeEventTypes } from '../../../src/constants/NodeEventTypes';

describe('<RuleCard />', () => {
  let renderResult: RenderResult;
  let data, label, onEvent, focusedId, id, clickResults;

  beforeEach(() => {
    clickResults = {
      onEvent: [],
    };
    label = 'ruleCard';

    onEvent = (...args) => {
      clickResults.onEvent.push(args);
    };
  });

  describe('focusedId is equal to id', () => {
    beforeEach(() => {
      focusedId = id = 'actions[0]';
    });

    describe('data has no actions', () => {
      beforeEach(() => {
        data = {};
        renderResult = render(
          <RuleCard data={data} focused={focusedId === id} id={id} label={label} onEvent={onEvent} />
        );
      });

      it(`shouldn't render openIcon`, () => {
        const { queryByTestId } = renderResult;
        expect(queryByTestId('OpenIcon')).toBe(null);
      });

      it('should trigger open node function when id = focusedId', async () => {
        const { findByTestId } = renderResult;
        const card = await findByTestId('IconCard');

        fireEvent.click(card);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.Expand, id]]);
      });
    });
    describe('data has actions', () => {
      beforeEach(() => {
        data = {
          actions: [
            {
              $kind: 'Microsoft.BeginDialog',
              dialog: 'CalleeDialog',
            },
          ],
        };
        renderResult = render(
          <RuleCard data={data} focused={focusedId === id} id={id} label={label} onEvent={onEvent} />
        );
      });

      it('renders openIcon & openIcon can be clicked', async () => {
        const { findByTestId } = renderResult;
        const openIcon = await findByTestId('OpenIcon');

        expect(openIcon).toBeTruthy();

        fireEvent.click(openIcon);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.OpenDialog, { caller: id, callee: 'CalleeDialog' }]]);
      });

      it('should trigger open node function when id = focusedId', async () => {
        const { findByTestId } = renderResult;
        const card = await findByTestId('IconCard');
        const openIcon = await findByTestId('OpenIcon');

        fireEvent.click(card);
        fireEvent.click(openIcon);

        expect(clickResults.onEvent).toEqual([
          [NodeEventTypes.Expand, id],
          [NodeEventTypes.OpenDialog, { caller: id, callee: 'CalleeDialog' }],
        ]);
      });
    });
  });

  describe('focusedId is not equal to id', () => {
    beforeEach(() => {
      focusedId = 'b';
      id = 'a';
    });

    describe('data has no steps', () => {
      beforeEach(() => {
        data = {};
        renderResult = render(
          <RuleCard data={data} focused={focusedId === id} id={id} label={label} onEvent={onEvent} />
        );
      });

      it(`shouldn't render openIcon & IconCard can be clicked`, async () => {
        const { queryByTestId, findByTestId } = renderResult;
        expect(queryByTestId('OpenIcon')).toBe(null);

        const card = await findByTestId('IconCard');
        expect(card).toBeTruthy();

        fireEvent.click(card);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.Expand, id]]);
      });

      it('should trigger focus node function when id != focusedId', async () => {
        const { findByTestId } = renderResult;
        const card = await findByTestId('IconCard');

        fireEvent.click(card);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.Expand, id]]);
      });
    });

    describe('data has steps', () => {
      beforeEach(() => {
        data = {
          actions: [
            {
              $kind: 'Microsoft.BeginDialog',
              dialog: 'CalleeDialog',
            },
          ],
        };
        renderResult = render(
          <RuleCard data={data} focused={focusedId === id} id={id} label={label} onEvent={onEvent} />
        );
      });

      it('renders openIcon & openIcon can be clicked', async () => {
        const { findByTestId } = renderResult;
        const openIcon = await findByTestId('OpenIcon');

        expect(openIcon).toBeTruthy();

        fireEvent.click(openIcon);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.OpenDialog, { caller: id, callee: 'CalleeDialog' }]]);
      });

      it('should trigger open node function when id != focusedId', async () => {
        const { findByTestId } = renderResult;
        const card = await findByTestId('IconCard');

        fireEvent.click(card);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.Expand, id]]);
      });
    });
  });
});
