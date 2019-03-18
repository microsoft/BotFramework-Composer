import files from './files';

import { all, fork } from 'redux-saga/effects';

export default function* root() {
  yield all([fork(files)]);
}
