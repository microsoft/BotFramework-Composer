import * as React from 'react';
import { render } from 'react-testing-library';

import NewStorageModal from './../../../src/components/StorageExplorer/NewStorage/NewStorageModal';

describe('<NewStorageModal/>', () => {
  it('should render the new storage modal', () => {
    render(
      <div>
        <NewStorageModal isOpen={true} />
      </div>
    );
    //TODO
    //expect(container).toHaveTextContent('Storage Type');
  });
});
