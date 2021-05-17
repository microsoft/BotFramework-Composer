export type DockerContext = {
  dockerfile: string;
  botPath: string;
  botName: string;
  imageName: string;
  username: string;
  password: string;
  registry?: string;
  logger?: (step: string, message: string, status?: number) => void;
};
export type Status = {
  status?: number;
  message: string;
  log: Record<string, string[]>;
};

export const Steps = {
  BUILD_IMAGE: 'Image build',
  VERIFY_IMAGE: 'Verifying image creation',
  PUSH_IMAGE: 'Pushing image',
};
