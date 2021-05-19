// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ACR } from '../ACR';
import { DockerHub } from '../DockerHub';
import { LocalDocker } from '../Local';
import { DockerEngines } from '../index';
import { CustomRegistry } from '../CustomRegistry';

describe('Test Docker Engine Factory', () => {
  it("When engine is 'local'", () => {
    const engine = DockerEngines.Factory('local');
    expect(engine).toBeInstanceOf(LocalDocker);
  });
  it("When engine is 'acr'", () => {
    const engine = DockerEngines.Factory('acr');
    expect(engine).toBeInstanceOf(ACR);
  });
  it("When engine is 'dockerhub'", () => {
    const engine = DockerEngines.Factory('dockerhub');
    expect(engine).toBeInstanceOf(DockerHub);
  });
  it("When engine is 'custom'", () => {
    const engine = DockerEngines.Factory('custom');
    expect(engine).toBeInstanceOf(CustomRegistry);
  });
  it('When engine is unknown', () => {
    expect(() => DockerEngines.Factory('')).toThrow(Error);
  });
});
