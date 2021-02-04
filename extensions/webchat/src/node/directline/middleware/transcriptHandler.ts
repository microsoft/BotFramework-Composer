// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StatusCodes } from 'http-status-codes';
import * as express from 'express';

import { DLServerState } from '../store/DLServerState';
import { Conversation } from '../store/entities/Conversation';
import { textItem } from '../utils/helpers';
import { writeFile, mkdirp } from '../utils/fileOperations';

export function saveTranscriptHandler(state: DLServerState) {
  return async (req: express.Request, res: express.Response): Promise<void> => {
    const { fileSavePath } = req.body;
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send('Conversation not found');
      const logItem = textItem('Error', 'Cannot find a matching conversation.');
      state.dispatchers.logToDocument(req.params.conversationId, logItem);
      return;
    }

    try {
      if (!fileSavePath?.length) {
        res.status(StatusCodes.BAD_REQUEST).send('Invalid file path to save the transcript.');
      }
      await mkdirp(fileSavePath);
      const transcripts = await conversation.getTranscript();
      const contentsToWrite = typeof transcripts === 'object' ? JSON.stringify(transcripts, null, 2) : transcripts;
      writeFile(fileSavePath, contentsToWrite);
      res.status(StatusCodes.CREATED).json({
        path: req.query.fileSavePath,
        message: 'Transcript has been saved to disk sunccesfully',
      });
    } catch (ex) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ex);
    }
  };
}

export function getTranscriptHandler(state: DLServerState) {
  return async (req: express.Request, res: express.Response): Promise<any> => {
    const conversation: Conversation = (req as any).conversation;
    if (!conversation) {
      res.status(StatusCodes.NOT_FOUND).send('Conversation not found');
      const logItem = textItem('Error', 'Cannot find a matching conversation.');
      state.dispatchers.logToDocument(req.params.conversationId, logItem);
      return;
    }

    try {
      const transcripts = await conversation.getTranscript();
      res.status(StatusCodes.OK).json(transcripts);
    } catch (ex) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ex);
    }
  };
}
