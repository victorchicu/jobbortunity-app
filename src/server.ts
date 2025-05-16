// import {APP_BASE_HREF} from '@angular/common';
// import {CommonEngine} from '@angular/ssr/node';
// import express from 'express';
// import {fileURLToPath} from 'node:url';
// import {dirname, join, resolve} from 'node:path';
// import bootstrap from './main.server';
//
// // The Express app is exported so that it can be used by serverless Functions.
// export function app(): express.Express {
//   const server = express();
//   const serverDistFolder = dirname(fileURLToPath(import.meta.url));
//   const browserDistFolder = resolve(serverDistFolder, '../browser');
//   const indexHtml = join(serverDistFolder, 'index.server.html');
//   const commonEngine = new CommonEngine();
//   server.set('view engine', 'html');
//   server.set('views', browserDistFolder);
//   // Serve data from URLS that begin "/api/"
//   server.get('/api/**', (req, res) => {
//     res.status(404).send('data requests are not yet supported');
//   });
//   // Serve static files from /browser
//   server.get(
//     '*.*',
//     express.static(browserDistFolder, {
//       maxAge: '1y',
//     }),
//   );
//   // All regular routes use the Angular engine
//   server.get('*', (req, res, next) => {
//     const {protocol, originalUrl, baseUrl, headers} = req;
//     commonEngine
//       .render({
//         bootstrap,
//         documentFilePath: indexHtml,
//         url: `${protocol}://${headers.host}${originalUrl}`,
//         publicPath: browserDistFolder,
//         providers: [{provide: APP_BASE_HREF, useValue: req.baseUrl}],
//       })
//       .then((html) => res.send(html))
//       .catch((err) => next(err));
//   });
//   return server;
// }
//
// function run(): void {
//   const port = process.env['PORT'] || 4000;
//   // Start up the Node server
//   const server = app();
//   server.listen(port, () => {
//     console.log(`Node Express server listening on http://localhost:${port}`);
//   });
// }
//
// run();

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
