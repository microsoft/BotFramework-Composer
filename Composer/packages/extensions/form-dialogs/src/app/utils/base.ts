// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

interface IDisposable {
  dispose: () => void;
}

type DisposableAdditionOptions = Partial<{
  ignoreAfterDisposal: boolean;
}>;

export function generateId() {
  const arr = crypto.getRandomValues(new Uint32Array(1));
  return `${arr[0]}`;
}

export interface ILifetime {
  add: (disposable: IDisposable | (() => void), options?: DisposableAdditionOptions) => ILifetime;
}

export class Lifetime implements ILifetime, IDisposable {
  private _disposables: IDisposable[];
  private _isDisposed = false;

  constructor() {
    this._disposables = [];
  }

  public add(disposable: IDisposable | Function, options?: DisposableAdditionOptions): ILifetime {
    const { ignoreAfterDisposal } = options || { ignoreAfterDisposal: false };

    if (this._isDisposed) {
      if (ignoreAfterDisposal) {
        return this;
      }

      throw new Error('A lifetime cannot add disposables after being disposed. Create a new lifetime instead.');
    }

    // tslint:disable-next-line: no-object-literal-type-assertion
    const d = typeof disposable === 'function' ? <IDisposable>{ dispose: disposable } : disposable;

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
