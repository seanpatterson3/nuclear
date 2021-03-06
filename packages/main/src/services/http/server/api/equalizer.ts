import { Event } from 'electron';
import express from 'express';
import { Validator } from 'express-json-validator-middleware';
import swagger, { ISwaggerizedRouter } from 'swagger-spec-express';

import { updateEqualizerSchema } from '../schema';
import { getStandardDescription } from '../swagger';
import Store from '../../../store';

const { validate } = new Validator({ allErrors: true });

export function equalizerRouter(store: Store, rendererWindow: Event['sender']): ISwaggerizedRouter {
  const router = express.Router() as ISwaggerizedRouter;

  swagger.swaggerize(router);

  router.get('/', (req, res) => {
    res.json(store.get('equalizer'));
  })
    .describe(getStandardDescription({
      successDescription: 'the selected equalizer and the presets',
      tags: ['Equalizer']
    }));

  router.post('/', validate(updateEqualizerSchema), (req, res) => {
    rendererWindow.send('update-equalizer', req.body.values);
    res.send();
  })
    .describe(getStandardDescription({
      tags: ['Equalizer'],
      body: ['eqValues']
    }));

  router.post('/:eqName/set', (req, res) => {
    const equalizerNames = Object.keys(store.get('equalizer').presets);

    if (!equalizerNames.includes(req.params.eqName)) {
      res.status(400).send(`name should be one of ${equalizerNames.toString()}`);
    } else {
      rendererWindow.send('set-equalizer', req.params.eqName);
      res.send();
    }
  })
    .describe(getStandardDescription({
      tags: ['Equalizer'],
      path: ['eqName']
    }));

  return router;
}
