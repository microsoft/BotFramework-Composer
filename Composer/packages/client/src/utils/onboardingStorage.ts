import storage from './storage';

const KEY = 'OnboardingState';
const DEFAULT_STATE = { complete: false };

interface IOnboardingState {
  complete: boolean;
  currentStep: number;
  currentSet: number;
}

class OnboardingState {
  private storage;
  private _all;
  constructor() {
    this.storage = storage;
    this._all = this.storage.get(KEY, DEFAULT_STATE);
  }

  get() {
    return this._all;
  }

  getComplete(defaultValue = false) {
    const { complete } = this._all;
    return complete || defaultValue;
  }

  getCurrentSet(defaultValue = -1) {
    const { currentSet } = this._all;
    return typeof currentSet !== 'undefined' ? currentSet : defaultValue;
  }

  getCurrentStep(defaultValue = -1) {
    const { currentStep } = this._all;
    return typeof currentStep !== 'undefined' ? currentStep : defaultValue;
  }

  set(state: Partial<IOnboardingState>) {
    this._all = state;
    this.storage.set(KEY, this._all);
  }

  setComplete(complete: boolean) {
    if (complete) {
      this._all = { complete };
    } else {
      this._all = { ...this._all, complete };
    }
    this.storage.set(KEY, this._all);
  }

  setCurrentSet(currentSet: number) {
    this._all = { ...this._all, currentSet };
    this.storage.set(KEY, this._all);
  }

  setCurrentStep(currentStep: number) {
    this._all = { ...this._all, currentStep };
    this.storage.set(KEY, this._all);
  }
}

export default new OnboardingState();
