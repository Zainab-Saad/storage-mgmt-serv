import { storageErrors } from '../errors/storage.error.js';
import {
  createStorageRecord,
  getStorageRecord,
  updateStorageRecord,
  updateAlertSent
} from '../services/storage.service.js';
import { resFailure, resSuccess } from '../utils/responseObject.util.js';

import { sendAlertEmail } from '../utils/alertEmail.util.js';

const MAX_STORAGE_ALLOWED_IN_BYTES = 10485760;
const MAX_STORAGE_ALLOWED_IN_MBS = 10;

const STORAGE_THRESHOLD_IN_BYTES = 8388608;
// const STORAGE_THRESHOLD_IN_MBS = 8;

export const checkStorage = async (req, res, next) => {
  try {
    let { imageSize } = req.query;
    const { user } = req;
    let userId = user.data.id;
    userId = parseInt(userId);
    imageSize = parseInt(imageSize);

    if (isNaN(imageSize) || imageSize <= 0) {
      return resFailure(res, storageErrors.INVALID_QUERY_PARAMS);
    }

    let storageRecord = await getStorageRecord(userId);

    if (!storageRecord) {
      storageRecord = await createStorageRecord(userId, 0);
    }

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
      return resSuccess(res, 'Storage Check Done', {
        userId,
        totalStorageUsed: storageRecord.totalStorageUsed,
        storageAvailable:
          MAX_STORAGE_ALLOWED_IN_BYTES - storageRecord.totalStorageUsed,
        imageSize,
        canUpload: false,
        reason: storageErrors.INSUFFICIENT_STORAGE_SPACE
      });
    }
  } catch (err) {
    console.log(err.message);
    return resFailure(res, err.message);
  }
};

export const updateStorage = async (req, res, next) => {
  try {
    const { imageSize, action } = req.body;
    const { user } = req;
    const userId = user.data.id;
    let isThresholdReached = false;
    let storageRecord = await getStorageRecord(userId);
    if (!storageRecord) {
      storageRecord = await createStorageRecord(userId, 0);
    }

    if (action.toLowerCase() === 'increase') {
      if (
        storageRecord.totalStorageUsed + imageSize >
        MAX_STORAGE_ALLOWED_IN_BYTES
      ) {
        return resFailure(res, storageErrors.INSUFFICIENT_STORAGE_SPACE);
      }
      storageRecord = await updateStorageRecord(
        storageRecord.userId,
        storageRecord.totalStorageUsed + imageSize
      );

      if (storageRecord.totalStorageUsed >= STORAGE_THRESHOLD_IN_BYTES) {
        if (!storageRecord.alertSent) {
          const storageLeft =
            MAX_STORAGE_ALLOWED_IN_MBS -
            storageRecord.totalStorageUsed / (1024 * 1024);
          sendAlertEmail(
            user.data.firstName + ' ' + user.data.lastName,
            storageLeft.toFixed(1),
            user.data.email
          );
          await updateAlertSent(storageRecord.userId, true);
        }
        isThresholdReached = true;
      }
    } else if (action.toLowerCase() === 'decrease') {
      if (storageRecord.totalStorageUsed - imageSize < 0) {
        return resFailure(res, storageErrors.DELETE_IMAGE_SIZE_EXCEEDED);
      }

      storageRecord = await updateStorageRecord(
        storageRecord.userId,
        storageRecord.totalStorageUsed - imageSize,
        isThresholdReached
      );
      if (
        storageRecord.alertSent &&
        storageRecord.totalStorageUsed < STORAGE_THRESHOLD_IN_BYTES
      ) {
        await updateAlertSent(storageRecord.userId, false);
      }
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
