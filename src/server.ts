import {APP_BASE_HREF} from '@angular/common';
import {CommonEngine} from '@angular/ssr/node';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import bootstrap from './main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');
  const commonEngine = new CommonEngine();
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);
  // Serve data from URLS that begin "/api/"
  server.get('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });
  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y',
    }),
  );
  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const {protocol, originalUrl, baseUrl, headers} = req;
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{provide: APP_BASE_HREF, useValue: req.baseUrl}],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });
  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
