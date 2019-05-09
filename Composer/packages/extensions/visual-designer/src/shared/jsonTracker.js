export function deleteNode(dialog, path) {
  delete dialog.steps[0];
  dialog.steps = dialog.steps.filter(x => x);
  return { ...dialog };
}
