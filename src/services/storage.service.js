import { db } from '../utils/db.util.js';

export const createStorageRecord = async (userId, totalStorageUsed) => {
  return await db.storageRecord.create({
    data: {
      userId,
      totalStorageUsed
    }
  });
};

export const getStorageRecord = async (userId) => {
  return await db.storageRecord.findUnique({
    where: {
      userId
    }
  });
};

export const updateStorageRecord = async (userId, totalStorageUsed) => {
  return await db.storageRecord.update({
    where: {
      userId
    },
    data: {
      totalStorageUsed
    }
  });
};

export const updateAlertSent = async (userId, alertSent) => {
  return await db.storageRecord.update({
    where: {
      userId
    },
    data: {
      alertSent
    }
  });
};
