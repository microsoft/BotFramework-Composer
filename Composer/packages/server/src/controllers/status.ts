// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BackgroundProcessManager } from '../services/backgroundProcessManager';

const getStatus = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    if (jobId) {
      const result = BackgroundProcessManager.getProcessStatus(jobId);
      if (result) {
        res.status(result.httpStatusCode).json({
          ...result,
          statusCode: result.httpStatusCode,
          message: result.latestMessage,
        });
      } else {
        res.status(404).json({
          statusCode: '404',
          message: 'JobId not found',
        });
      }
    } else {
      res.status(400).json({
        statusCode: '400',
        message: 'JobId not provided',
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: '500',
      message: err.message,
    });
  }
};

export const StatusController = {
  getStatus,
};
