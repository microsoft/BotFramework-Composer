export const flatten = (input: any[][]): any[] => {
  return input.reduce((acc, curr) => [...acc, ...curr]);
};
