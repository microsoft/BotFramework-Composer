// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

export const generateId = () => {
  const arr = crypto.getRandomValues(new Uint32Array(1));
  return `${arr[0]}`;
};

type Disposable = {
  dispose: () => void;
};

type DisposableAdditionOptions = Partial<{
  ignoreAfterDisposal: boolean;
}>;

export class Lifetime implements Disposable {
  private _disposables: Disposable[];
  private _isDisposed = false;

  constructor() {
    this._disposables = [];
  }

  public add(disposable: Disposable | Function, options?: DisposableAdditionOptions) {
    const { ignoreAfterDisposal } = options || { ignoreAfterDisposal: false };

    if (this._isDisposed) {
      if (ignoreAfterDisposal) {
        return this;
      }

      throw new Error('A lifetime cannot add disposables after being disposed. Create a new lifetime instead.');
    }

    // tslint:disable-next-line: no-object-literal-type-assertion
    const d = typeof disposable === 'function' ? <Disposable>{ dispose: disposable } : disposable;

    this._disposables.push(d);

    return this;
  }

  public dispose() {
    if (!this._isDisposed) {
      this._disposables.forEach((d) => d.dispose());
      this._isDisposed = true;
    }
  }
}
