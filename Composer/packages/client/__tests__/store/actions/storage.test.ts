// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import httpClient from '../../../src/utils/httpUtil';
import { ActionTypes } from '../../../src/constants';
import { fetchFolderItemsByPath } from '../../../src/store/action/storage';
import { Store } from '../../../src/store/types';

jest.mock('../../../src/utils/httpUtil');

const dispatch = jest.fn();

const store = ({ dispatch, getState: () => ({}) } as unknown) as Store;

describe('fetchFolderItemsByPath', () => {
  const id = 'default';
  const path = '/some/path';

  it('dispatches SET_STORAGEFILE_FETCHING_STATUS', async () => {
    await fetchFolderItemsByPath(store, id, path);

    expect(dispatch).toBeDispatchedWith(ActionTypes.SET_STORAGEFILE_FETCHING_STATUS, {
      status: 'pending',
    });
  });

  it('fetches folder items from api', async () => {
    await fetchFolderItemsByPath(store, id, path);

    expect(httpClient.get).toHaveBeenCalledWith(`/storages/${id}/blobs`, { params: { path } });
  });

  describe('when api call is successful', () => {
    beforeEach(() => {
      (httpClient.get as jest.Mock).mockResolvedValue({ some: 'response' });
    });

    it('dispatches GET_STORAGEFILE_SUCCESS', async () => {
      await fetchFolderItemsByPath(store, id, path);

      expect(dispatch).toBeDispatchedWith(ActionTypes.GET_STORAGEFILE_SUCCESS, {
        response: { some: 'response' },
      });
    });
  });

  describe('when api call fails', () => {
    beforeEach(() => {
      (httpClient.get as jest.Mock).mockRejectedValue('some error');
    });

    it('dispatches SET_STORAGEFILE_FETCHING_STATUS', async () => {
      await fetchFolderItemsByPath(store, id, path);

      expect(dispatch).toBeDispatchedWith(
        ActionTypes.SET_STORAGEFILE_FETCHING_STATUS,
        {
          status: 'failure',
        },
        'some error'
      );
    });
  });
});
