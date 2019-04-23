import { getDialogData } from '../../src/utils/dialogUtil';

const dialogsMap = {
  Dialog1: {
    steps: [
      {
        $type: 'Step1',
      },
      {
        $type: 'Step2',
      },
    ],
  },
  'Dialog2.main': {
    steps: [
      {
        $type: 'Step3',
      },
      {
        $type: 'Step4',
      },
    ],
  },
};

describe('getDialogData', () => {
  it('returns all dialog data if path is a top level property', () => {
    const result = getDialogData(dialogsMap, 'Dialog1');
    expect(result).toEqual(dialogsMap.Dialog1);
  });

  it('returns all dialog data if path is a top level property and has a "."', () => {
    const result = getDialogData(dialogsMap, 'Dialog2.main');
    expect(result).toEqual(dialogsMap['Dialog2.main']);
  });

  it('returns a sub path', () => {
    const result = getDialogData(dialogsMap, 'Dialog1.steps[1]');
    expect(result).toEqual(dialogsMap.Dialog1.steps[1]);
  });

  it('returns a sub path when "." is in path', () => {
    const result = getDialogData(dialogsMap, 'Dialog2.main.steps[1]');
    expect(result).toEqual(dialogsMap['Dialog2.main'].steps[1]);
  });
});
