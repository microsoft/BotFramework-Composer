import { walkAdaptiveAction } from '../../src/utils/walkAdaptiveAction';

describe('#walkAdaptiveAction', () => {
  const action = {
    $type: 'Microsoft.IfCondition',
    actions: [{ $type: 'Microsoft.SendActivity' }],
    elseActions: [
      {
        $type: 'Microsoft.Foreach',
        actions: [{ $type: 'Microsoft.SendActivity' }],
      },
    ],
  };

  it('can walk every child Adaptive Action node', async () => {
    let actionCount = 0;
    const counter: any = () => {
      actionCount += 1;
    };
    await walkAdaptiveAction(action, counter);
    expect(actionCount).toEqual(4);
  });
});
