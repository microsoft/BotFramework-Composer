// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import * as express from 'express';
import formatMessage from 'format-message';

import { DLServerState } from '../store/dlServerState';
import { Conversation } from '../store/entities/conversation';
import { textItem } from '../utils/helpers';
import { writeFile, mkdirp } from '../utils/fileOperations';
import logger from '../utils/logger';

export const saveTranscriptHandler = (state: DLServerState) => {
  return async (req: express.Request, res: express.Response): Promise<void> => {
    const { fileSavePath } = req.body;
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      const message = formatMessage('Cannot find a matching conversation.');
      res.status(StatusCodes.NOT_FOUND).send(message);
      const logItem = textItem('Error', message);
      state.dispatchers.logToDocument(req.params.conversationId, logItem);
      return;
    }

    try {
      if (!fileSavePath?.length) {
        res.status(StatusCodes.BAD_REQUEST).send(formatMessage('Invalid file path to save the transcript.'));
      }
      await mkdirp(fileSavePath);
      const transcripts = await conversation.getTranscript();
      const contentsToWrite = typeof transcripts === 'object' ? JSON.stringify(transcripts, null, 2) : transcripts;
      writeFile(fileSavePath, contentsToWrite);
      res.status(StatusCodes.CREATED).json({
        path: req.query.fileSavePath,
        message: 'Transcript has been saved to disk successfully',
      });
    } catch (ex) {
      logger(ex);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(formatMessage('An error occured saving the transcript to disk.'));
    }
  };
};

export const getTranscriptHandler = (state: DLServerState) => {
  return async (req: express.Request, res: express.Response): Promise<any> => {
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      const message = formatMessage('Cannot find a matching conversation.');
      res.status(StatusCodes.NOT_FOUND).send(message);
      const logItem = textItem('Error', message);
      state.dispatchers.logToDocument(req.params.conversationId, logItem);
      return;
    }

    try {
      const transcripts = await conversation.getTranscript();
      res.status(StatusCodes.OK).json(transcripts);
    } catch (ex) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(formatMessage('An error occurred parsing the transcript for a conversation'));
    }
  };
};
