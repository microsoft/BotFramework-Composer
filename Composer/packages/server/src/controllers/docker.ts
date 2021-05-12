import { Request, Response } from 'express';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const getLocalTags = async (image: string): Promise<string[]> => {
  const command = `docker images ${image} --format "{{.Tag}}"`;
  const { stderr, stdout } = await execAsync(command);
  const versions = stdout.split(/[\r\n]+/).filter((i) => i);

  if (stderr) {
    throw stderr;
  }

  return versions;
};
const getACRTags = async (url: string, options: RequestInit): Promise<string[]> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw await response.text();
  }

  const json = await response.json();
  const versions = json.tags.map((o) => o.name);

  return versions;
};
const getDockerHubTags = async (image: string, authentication: any): Promise<string[]> => {
  let response = await fetch('https://hub.docker.com/v2/users/login/', {
    method: 'POST',
    body: JSON.stringify(authentication),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (!response.ok) {
    throw await response.text();
  }
  const { token } = await response.json();

  const tagUrl = `https://hub.docker.com/v2/repositories/${authentication.username}/${image}/tags`;
  response = await fetch(tagUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();
  const versions = json.results.map((o) => o.name);

  return versions;
};
const getTags = async (req: Request, res: Response) => {
  const { from, image } = req.params;
  const options: RequestInit = req.body;

  try {
    let versions: string[];

    switch (from) {
      case 'local':
        versions = await getLocalTags(image);
        break;

      case 'acr':
        versions = await getACRTags(image, options);
        break;

      case 'dockerhub':
        versions = await getDockerHubTags(image, options);
        break;

      default:
        versions = [];
    }

    res.status(200).json(versions);
  } catch (err) {
    res.status(500).json({ Error: err });
  }
};

const checkDockerVersion = async (req: Request, res: Response) => {
  try {
    const { stderr: checkDockerError, stdout: dockeVersion } = await execAsync('docker -v');

    if (checkDockerError) {
      throw new Error('Docker not found.');
    }

    res.status(200).json({
      userHasDocker: true,
      DockerVersion: dockeVersion,
    });
  } catch (err) {
    res.status(200).json({ userHasDocker: false });
  }
};

export const DockerEngineController = {
  getTags,
  checkDockerVersion,
};
