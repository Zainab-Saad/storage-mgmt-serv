import { check } from 'express-validator';

export const storageCheckValidator = [
  check('userId', 'User ID cannot be undefined'),
  check('imageSize', 'Image size cannot be undefined; should be size in bytes')
];

export const updateStorageValidator = [
  check('userId', 'User ID cannot be undefined'),
  check('imageSize', 'Image size cannot be undefined; should be size in bytes'),
  check(
    'action',
    'Action cannot be undefined; valid values are increase/decrease'
  ).matches(/^(increase|decrease)$/, 'i')
];
