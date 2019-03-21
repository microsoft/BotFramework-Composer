export const isTracable = (x: any) => {
  if (x.path && x.data) {
    return true;
  }
  return false;
};
