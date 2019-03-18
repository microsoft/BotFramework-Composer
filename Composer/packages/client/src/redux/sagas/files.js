import axios from 'axios';

import { BASEURL, ActionTypes } from './../../constants/index';

import { all, call, put, takeLatest } from 'redux-saga/effects';

export function* getFiles() {
  try {
    const response = yield call(axios.get, `${BASEURL}/fileserver`);
    yield put({
      type: ActionTypes.FILES_GET_SUCCESS,
      payload: response,
    });
  } catch (err) {
    yield put({
      type: ActionTypes.FILES_GET_FAILURE,
      payload: err,
    });
  }
}

export default function* root() {
  yield all([takeLatest(ActionTypes.FILES_GET, getFiles)]);
}
