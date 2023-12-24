import express from 'express';
import { updateStorageValidator } from '../middlewares/storage.middleware.js';
import { validateResult } from '../utils/validationResult.util.js';
import {
  checkStorage,
  updateStorage
} from '../controllers/storage.controller.js';

export const storageRouter = express.Router();

storageRouter.get('/check-storage', checkStorage);

storageRouter.post(
  '/update-storage',
  updateStorageValidator,
  validateResult,
  updateStorage
);
