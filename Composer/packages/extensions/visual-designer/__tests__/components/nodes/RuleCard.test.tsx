import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { RuleCard } from '../../../src/components/nodes/templates/RuleCard';
import { NodeEventTypes } from '../../../src/shared/NodeEventTypes';

describe('<RuleCard />', () => {
  let renderResult, data, label, onEvent, focusedId, id, clickResults;

  beforeEach(() => {
    clickResults = {
      onEvent: [],
    };
    label = 'ruleCard';

    onEvent = (...args) => {
      clickResults.onEvent.push(args);
    };
  });

  afterEach(cleanup);
  describe('focusedId is equal to id', () => {
    beforeEach(() => {
      focusedId = id = 'steps[0]';
    });

    describe('data has no steps', () => {
      beforeEach(() => {
        data = {};
        renderResult = render(
          <RuleCard data={data} id={id} focused={focusedId === id} label={label} onEvent={onEvent} />
        );
      });

      it(`shouldn't render openIcon`, async () => {
        const { findByTestId } = renderResult;
        expect(findByTestId('OpenIcon')).rejects.toThrow();
      });

      it('should trigger open node function when id = focusedId', async () => {
        const { findByTestId } = renderResult;
        const card = await findByTestId('IconCard');

        fireEvent.click(card);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.Expand, id]]);
      });
    });
    describe('data has steps', () => {
      beforeEach(() => {
        data = {
          steps: [
            {
              $type: 'Microsoft.BeginDialog',
              dialog: 'CalleeDialog',
            },
          ],
        };
        renderResult = render(
          <RuleCard data={data} id={id} focused={focusedId === id} label={label} onEvent={onEvent} />
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
          <RuleCard data={data} id={id} focused={focusedId === id} label={label} onEvent={onEvent} />
        );
      });

      it(`shouldn't render openIcon & IconCard can be clicked`, async () => {
        const { findByTestId } = renderResult;
        expect(findByTestId('OpenIcon')).rejects.toThrow();

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
          steps: [
            {
              $type: 'Microsoft.BeginDialog',
              dialog: 'CalleeDialog',
            },
          ],
        };
        renderResult = render(
          <RuleCard data={data} id={id} focused={focusedId === id} label={label} onEvent={onEvent} />
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
