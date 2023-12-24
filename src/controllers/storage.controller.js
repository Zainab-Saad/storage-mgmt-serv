import { storageErrors } from '../errors/storage.error.js';
import {
  createStorageRecord,
  getStorageRecord,
  updateStorageRecord
} from '../services/storage.service.js';
import { resFailure, resSuccess } from '../utils/responseObject.util.js';

const MAX_STORAGE_ALLOWED_IN_BYTES = 10485760;
const MAX_STORAGE_ALLOWED_IN_MBS = 10;

const STORAGE_THRESHOLD_IN_BYTES = 8388608;
const STORAGE_THRESHOLD_IN_MBS = 8;

export const checkStorage = async (req, res, next) => {
  try {
    let { userId, imageSize } = req.query;
    console.log(parseInt(userId), parseInt(imageSize));
    userId = parseInt(userId);
    imageSize = parseInt(imageSize);

    if (isNaN(userId) || isNaN(imageSize) || imageSize <= 0) {
      return resFailure(res, storageErrors.INVALID_QUERY_PARAMS);
    }

    let storageRecord = await getStorageRecord(userId);

    if (!storageRecord) {
      storageRecord = await createStorageRecord(userId, 0);
    }
    console.log(storageRecord);

    if (
      storageRecord.totalStorageUsed + imageSize <=
      MAX_STORAGE_ALLOWED_IN_BYTES
    ) {
      return resSuccess(res, 'Storage Check Done', {
        userId,
        totalStorageUsed: storageRecord.totalStorageUsed,
        storageAvailable:
          MAX_STORAGE_ALLOWED_IN_BYTES - storageRecord.totalStorageUsed,
        imageSize,
        canUpload: true
      });
    } else {
      return resFailure(
        res,
        'Storage Check Done',
        {
          userId,
          totalStorageUsed: storageRecord.totalStorageUsed,
          storageAvailable:
            MAX_STORAGE_ALLOWED_IN_BYTES - storageRecord.totalStorageUsed,
          imageSize,
          canUpload: false,
          reason: storageErrors.INSUFFICIENT_STORAGE_SPACE
        },
        403
      );
    }
  } catch (err) {
    console.log(err.message);
    return resFailure(res, err.message);
  }
};

export const updateStorage = async (req, res, next) => {
  try {
    const { userId, imageSize, action } = req.body;
    let storageRecord = await getStorageRecord(userId);
    if (!storageRecord) {
      storageRecord = await createStorageRecord(userId, 0);
    }
    if (action.toLowerCase() === 'increase') {
      storageRecord = await updateStorageRecord(
        storageRecord.userId,
        storageRecord.totalStorageUsed + imageSize
      );
    } else if (action.toLowerCase() === 'decrease') {
      storageRecord = await updateStorageRecord(
        storageRecord.userId,
        storageRecord.totalStorageUsed - imageSize
      );
    }

    return resSuccess(res, 'Storage update successful', {
      userId,
      totalStorageUsed: storageRecord.totalStorageUsed,
      storageAvailable:
        MAX_STORAGE_ALLOWED_IN_BYTES - storageRecord.totalStorageUsed
    });
  } catch (err) {
    console.log(err.message);
    return resFailure(res, err.message);
  }
};
