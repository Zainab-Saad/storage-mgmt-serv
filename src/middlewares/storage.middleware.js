import { check } from 'express-validator';
import axios from 'axios';
import { resFailure } from '../utils/responseObject.util.js';
import { storageErrors } from '../errors/storage.error.js';

export const hasAuthToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return resFailure(res, storageErrors.INVALID_AUTH_HEADER, {}, 403);
  }
  next();
};

export const authenticateUser = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization.split(' ')[1];
    const response = await axios.get(
      `http://${process.env.USER_ACC_MGMT_SERV_IP}:${process.env.USER_ACC_MGMT_SERV_PORT}/get-me`,
      {
        headers: {
          Authorization: `Bearer ${authorizationHeader}`
        }
      }
    );
    req.user = response.data;
    next();
  } catch (err) {
    console.log(err.message);
    return resFailure(res, err.message);
  }
};

export const storageCheckValidator = [
  check(
    'imageSize',
    'Image size cannot be undefined; should be size in bytes'
  ).notEmpty()
];

export const updateStorageValidator = [
  check(
    'imageSize',
    'Image size cannot be undefined; should be size in bytes'
  ).notEmpty(),
  check(
    'action',
    'Action cannot be undefined; valid values are increase/decrease'
  ).matches(/^(increase|decrease)$/, 'i')
];
