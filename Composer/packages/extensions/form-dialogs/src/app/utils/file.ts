// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/consistent-type-assertions */

export const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.readAsText(file);
    fileReader.onload = () => resolve(<string>fileReader.result);
    fileReader.onerror = reject;
  });
};
