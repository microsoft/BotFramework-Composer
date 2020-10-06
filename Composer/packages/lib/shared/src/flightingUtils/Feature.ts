// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const Feature = (name: string, variation: string, children: any) => {
  const flags = useContext(FeaturesContext);

  if (!children) return null;

  if (variation === undefined) {
    return flags[name] ? children : null;
  }

  return flags[name] === variation ? children : null;
};
