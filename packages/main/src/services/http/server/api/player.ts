import { NuclearStatus } from '@nuclear/common';
import express from 'express';
import { ipcMain, Event } from 'electron';
import { Validator } from 'express-json-validator-middleware';
import swagger, { ISwaggerizedRouter } from 'swagger-spec-express';

import { volumeSchema, seekSchema } from '../schema';
import { getStandardDescription } from '../swagger';


const { validate } = new Validator({ allErrors: true });

export function playerRouter(rendererWindow: Event['sender']): ISwaggerizedRouter {

  const router = express.Router() as ISwaggerizedRouter;
  
  swagger.swaggerize(router);

  router
    .get('/now-playing', (req, res) => {
      rendererWindow.send('playing-status');
      ipcMain.once('playing-status', (evt: Event, data: NuclearStatus) => {
        res.json(data);
      });
    })
    .describe(
      getStandardDescription({
        successDescription: 'the status of nuclear player',
        tags: ['Player']
      })
    );

  router
    .post('/next', (req, res) => {
      rendererWindow.send('next');
      res.send();
    })
    .describe(getStandardDescription({ tags: ['Player'] }));

  router
    .post('/previous', (req, res) => {
      rendererWindow.send('previous');
      res.send();
    })
    .describe(getStandardDescription({ tags: ['Player'] }));

  router
    .post('/pause', (req, res) => {
      rendererWindow.send('pause');
      res.send();
    })
    .describe(getStandardDescription({ tags: ['Player'] }));

  router
    .post('/play-pause', (req, res) => {
      rendererWindow.send('playpause');
      res.send();
    })
    .describe(getStandardDescription({ tags: ['Player'] }));

  router
    .post('/stop', (req, res) => {
      rendererWindow.send('stop');
      res.send();
    })
    .describe(getStandardDescription({ tags: ['Player'] }));

  router
    .post('/play', (req, res) => {
      rendererWindow.send('play');
      res.send();
    })
    .describe(getStandardDescription({ tags: ['Player'] }));

  router
    .post('/mute', (req, res) => {
      rendererWindow.send('mute');
      res.send();
    })
    .describe(getStandardDescription({ tags: ['Player'] }));

  router
    .post('/volume', validate(volumeSchema), (req, res) => {
      rendererWindow.send('volume', req.body.value);
      res.send();
    })
    .describe(
      getStandardDescription({
        tags: ['Player'],
        body: ['volumeValue']
      })
    );

  router
    .post('/seek', validate(seekSchema), (req, res) => {
      rendererWindow.send('send', req.body.value);
      res.send();
    })
    .describe(
      getStandardDescription({
        tags: ['Player'],
        body: ['seekValue']
      })
    );
  
  return router;
}
