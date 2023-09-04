import {
  MAX_EMAIL_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_EMAIL_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MIN_FIRST_NAME_LENGTH,
  MIN_LAST_NAME_LENGTH,
} from '$lib/constants.js';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

export const isDisplayNameValid = (displayName: string) =>
  displayName.trim().length >= MIN_DISPLAY_NAME_LENGTH &&
  displayName.trim().length <= MAX_DISPLAY_NAME_LENGTH;

export const isFirstNameValid = (firstName: string) =>
  firstName.trim().length >= MIN_FIRST_NAME_LENGTH &&
  firstName.trim().length <= MAX_FIRST_NAME_LENGTH;

export const isLastNameValid = (lastName: string) =>
  lastName.trim().length >= MIN_LAST_NAME_LENGTH &&
  lastName.trim().length <= MAX_LAST_NAME_LENGTH;

export const isEmailValid = (email: string) =>
  email.trim().length >= MIN_EMAIL_LENGTH &&
  email.trim().length <= MAX_EMAIL_LENGTH &&
  isEmail(email);

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};

zxcvbnOptions.setOptions(options);

export const isPasswordValid = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH &&
  password.length <= MAX_PASSWORD_LENGTH &&
  zxcvbn(password).score >= 3;

export const isMobileNumberValid = (mobile: string) =>
  mobile.trim().length === 0 || (
    mobile.trim().length <= 30 &&
    isMobilePhone(mobile.trim())
  );

export const isValid = (
  displayName: string,
  firstName: string,
  lastName: string,
  email: string,
  mobile: string,
  password: string,
) => (
  isDisplayNameValid(displayName) &&
  isFirstNameValid(firstName) &&
  isLastNameValid(lastName) &&
  isPasswordValid(password) &&
  isMobileNumberValid(mobile) &&
  isEmailValid(email)
);
