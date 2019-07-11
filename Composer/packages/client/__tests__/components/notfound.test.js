import { BASEPATH } from '../../src/constants/index';
import { NotFound } from '../../src/components/NotFound/index';

describe('<NotFound/>', () => {
  it('should render null on BASEPATH', async () => {
    expect(NotFound({ uri: BASEPATH })).toBeNull();
  });
});
