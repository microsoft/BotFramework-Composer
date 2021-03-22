// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';

import { FileAsset } from '../../persistence/types';

import { CalculatorType, FilesDifferencePayload } from './../types';

type DifferenceMessage = {
  id: string;
  type: CalculatorType;
  payload: FilesDifferencePayload;
};

type MessageEvent = DifferenceMessage;

const ctx: Worker = self as any;

const getCompareFields = (value: FileAsset) => {
  const { id, content } = value;
  return { id, content };
};

const comparator = (value: FileAsset, other: FileAsset) => {
  return isEqual(getCompareFields(value), getCompareFields(other));
};

export function getDifferenceItems(target: FileAsset[], origin: FileAsset[]) {
  const changes1 = differenceWith(target, origin, comparator);
  const changes2 = differenceWith(origin, target, comparator);
  const deleted = changes2.filter((change) => !target.some((file) => change.id === file.id));
  const { updated, added } = changes1.reduce(
    (result: { updated: FileAsset[]; added: FileAsset[] }, change) => {
      if (origin.some((file) => change.id === file.id)) {
        result.updated.push(change);
      } else {
        result.added.push(change);
      }

      return result;
    },
    { updated: [], added: [] }
  );

  return { updated, added, deleted };
}

function handleMessage(message: MessageEvent) {
  const { type, payload } = message;

  switch (type) {
    case 'difference': {
      const { target, origin } = payload;
      return getDifferenceItems(target, origin);
    }
    default: {
      return null;
    }
  }
}

ctx.onmessage = function (event) {
  const msg = event.data as MessageEvent;
  try {
    const result = handleMessage(msg);
    ctx.postMessage({ id: msg.id, payload: result });
  } catch (error) {
    ctx.postMessage({ id: msg.id, error: error.message });
  }
};
