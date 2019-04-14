import ProjectService from '../services/project';

import { Request, Response } from 'express';

async function getProject(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const files = await ProjectService.currentBotProject.getFiles();
    res.status(200).json({ projectFiles: files });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

export const ProjectController = {
  getProject: getProject,
};
