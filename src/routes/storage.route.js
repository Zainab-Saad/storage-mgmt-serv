import express from 'express';

import { validateResult } from '../utils/validationResult.util.js';
import {
  checkStorage,
  updateStorage
} from '../controllers/storage.controller.js';
import { hasAuthToken, authenticateUser, updateStorageValidator } from '../middlewares/storage.middleware.js';

export const storageRouter = express.Router();

storageRouter.get('/check-storage', hasAuthToken, authenticateUser, checkStorage);

storageRouter.post(
  '/update-storage',
  hasAuthToken,
  authenticateUser,
  updateStorageValidator,
  validateResult,
  updateStorage
);
