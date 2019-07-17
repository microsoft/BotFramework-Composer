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
      focusedId = id = 'a';
    });

    describe('data has no steps', () => {
      beforeEach(() => {
        data = {};
        renderResult = render(<RuleCard data={data} id={id} focusedId={focusedId} label={label} onEvent={onEvent} />);
      });

      // it('renders openIcon & openIcon can be clicked', async () => {
      //   const { findByTestId } = renderResult;
      //   const openIcon = await findByTestId('OpenIcon');

      //   expect(openIcon).toBeTruthy();

      //   fireEvent.click(openIcon);
      //   expect(clickResults.onEvent).toEqual([[NodeEventTypes.Expand, id]]);
      // });

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
              dialog: 'Hi! I\'m a ToDo bot. Say "add a todo named first" to get started.',
            },
          ],
        };
        renderResult = render(<RuleCard data={data} id={id} focusedId={focusedId} label={label} onEvent={onEvent} />);
      });

      // it('renders openIcon & openIcon can be clicked', async () => {
      //   const { findByTestId } = renderResult;
      //   const openIcon = await findByTestId('OpenIcon');

      //   expect(openIcon).toBeTruthy();

      //   fireEvent.click(openIcon);
      //   expect(clickResults.onEvent).toEqual([[NodeEventTypes.OpenLink, data.steps[0]['dialog']]]);
      // });

      it('should trigger open node function when id = focusedId', async () => {
        const { findByTestId } = renderResult;
        const card = await findByTestId('IconCard');

        fireEvent.click(card);
        console.log(clickResults.onEvent);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.Expand, 'a']]); // data.steps[0]['dialog']]]);
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
        renderResult = render(<RuleCard data={data} id={id} focusedId={focusedId} label={label} onEvent={onEvent} />);
      });

      // it('renders openIcon & openIcon can be clicked', async () => {
      //   const { findByTestId } = renderResult;
      //   const openIcon = await findByTestId('OpenIcon');

      //   expect(openIcon).toBeTruthy();

      //   fireEvent.click(openIcon);
      //   expect(clickResults.onEvent).toEqual([[NodeEventTypes.Expand, id]]);
      // });

      it('should trigger focus node function when id != focusedId', async () => {
        const { findByTestId } = renderResult;
        const card = await findByTestId('IconCard');

        fireEvent.click(card);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.Focus, id]]);
      });
    });
    describe('data has steps', () => {
      beforeEach(() => {
        data = {
          steps: [
            {
              $type: 'Microsoft.BeginDialog',
              dialog: 'Hi! I\'m a ToDo bot. Say "add a todo named first" to get started.',
            },
          ],
        };
        renderResult = render(<RuleCard data={data} id={id} focusedId={focusedId} label={label} onEvent={onEvent} />);
      });

      // it('renders openIcon & openIcon can be clicked', async () => {
      //   const { findByTestId } = renderResult;
      //   const openIcon = await findByTestId('OpenIcon');

      //   expect(openIcon).toBeTruthy();

      //   fireEvent.click(openIcon);
      //   expect(clickResults.onEvent).toEqual([[NodeEventTypes.OpenLink, data.steps[0]['dialog']]]);
      // });

      it('should trigger open node function when id != focusedId', async () => {
        const { findByTestId } = renderResult;
        const card = await findByTestId('IconCard');

        fireEvent.click(card);
        expect(clickResults.onEvent).toEqual([[NodeEventTypes.Focus, id]]);
      });
    });
  });
});
