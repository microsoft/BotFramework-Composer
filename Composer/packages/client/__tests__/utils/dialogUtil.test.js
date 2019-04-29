import { getDialogData, setDialogData } from '../../src/utils/dialogUtil';

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
    const result = getDialogData(dialogsMap, 'Dialog1#');
    expect(result).toEqual(dialogsMap.Dialog1);
  });

  it('returns all dialog data if path is a top level property and has a "."', () => {
    const result = getDialogData(dialogsMap, 'Dialog2.main#');
    expect(result).toEqual(dialogsMap['Dialog2.main']);
  });

  it('returns a sub path', () => {
    const result = getDialogData(dialogsMap, 'Dialog1#steps[1]');
    expect(result).toEqual(dialogsMap.Dialog1.steps[1]);
  });

  it('returns a sub path when "." is in path', () => {
    const result = getDialogData(dialogsMap, 'Dialog2.main#steps[1]');
    expect(result).toEqual(dialogsMap['Dialog2.main'].steps[1]);
  });
});

describe('setDialogData', () => {
  it('returns updated top level dialog data', () => {
    const result = setDialogData(dialogsMap, 'Dialog2.main#', { new: 'data' });
    expect(result).toEqual({ new: 'data' });
  });

  it('returns updated dialog data at a path', () => {
    const result = setDialogData(dialogsMap, 'Dialog2.main#steps[1]', { new: 'data' });
    expect(result).toEqual({ steps: [{ $type: 'Step3' }, { new: 'data' }] });
  });
});
