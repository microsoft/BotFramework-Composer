import * as RendererCollection from '../../../src/components/nodes/index';

test('every renderer should use sharedProps', () => {
  Object.values(RendererCollection).forEach(renderer => {
    expect(renderer.propTypes).toBeTruthy();
    expect(renderer.propTypes.id).toBeTruthy();
    expect(renderer.propTypes.data).toBeTruthy();
    expect(renderer.propTypes.onEvent).toBeTruthy();
  });
});
