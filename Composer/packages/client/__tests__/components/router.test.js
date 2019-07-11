import * as React from 'react';
import { render } from 'react-testing-library';
import { BASEPATH } from '../../src/constants/index';
import Routes from '../../src/router';

describe('Router', async () => {
  it('should use basepath', async () => {
    const result = render(<Routes component={null} match={BASEPATH} />);
    const root = result.baseElement;
    expect(root.getAttribute('path')).toBe(BASEPATH);
  });
});
