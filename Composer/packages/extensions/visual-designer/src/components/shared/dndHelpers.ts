export const DndSignature = 'source=dnd;data=';

const isDndData = (input): boolean => {
  return input.indexOf(DndSignature) === 0;
};

const packDndData = (data): string => {
  return DndSignature + JSON.stringify(data);
};

const unpackDndData = (input: string) => {
  return JSON.parse(input.replace(DndSignature, ''));
};

export const isDndElement = (el: EventTarget): boolean => {
  let target: any = el;
  while (target) {
    if (target.classList.contains('card')) return true;
    target = target.parentElement;
  }
  return false;
};

export const setDndData = (e: React.DragEvent, data): void => {
  const payloadString = packDndData(data);
  e.dataTransfer.setData('text/plain', payloadString);
};

export const getDndData = (e: React.DragEvent): any => {
  const payloadString = e.dataTransfer.getData('text/plain');
  if (!isDndData(payloadString)) {
    return {};
  }

  return unpackDndData(payloadString);
};
