// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BackgroundProcessManager } from '../services/backgroundProcessManager';
import { BotProjectService } from '../services/project';

const getStatus = async (req, res) => {
  //   const type = req.params.type;
  //   const target = req.params.target;
  //   const projectId = req.params.projectId;
  //   const user = await ExtensionContext.getUserFromRequest(req);
  // const currentProject = await BotProjectService.getProjectById(projectId);
  const jobId = req.params.jobId;
  try {
    if (jobId) {
      const result = BackgroundProcessManager.getStatus(jobId);
      if (result) {
        res.status(result.status).json(result);
      }
    }
  } catch (err) {
    res.status(400).json({
      statusCode: '400',
      message: err.message,
    });
  }
};

export const StatusController = {
  getStatus,
};
