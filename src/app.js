import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import { storageRouter } from './routes/storage.route.js';

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.use(storageRouter);

const PORT = process.env.NODE_DOCKER_PORT;
app.listen(PORT, () => {
  console.info(`storage-mgmt server running at port ${PORT}`);
});
