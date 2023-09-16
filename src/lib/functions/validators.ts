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

export const isDisplayNameValid = (displayname: string) =>
  displayname.trim().length >= MIN_DISPLAY_NAME_LENGTH &&
    displayname.trim().length <= MAX_DISPLAY_NAME_LENGTH;

export const isFirstNameValid = (firstname: string) =>
  firstname.trim().length >= MIN_FIRST_NAME_LENGTH &&
    firstname.trim().length <= MAX_FIRST_NAME_LENGTH;

export const isLastNameValid = (lastname: string) =>
  lastname.trim().length >= MIN_LAST_NAME_LENGTH &&
    lastname.trim().length <= MAX_LAST_NAME_LENGTH;

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
  displayname: string,
  firstname: string,
  lastname: string,
  email: string,
  mobile: string,
  password: string,
) => (
  isDisplayNameValid(displayname) &&
  isFirstNameValid(firstname) &&
  isLastNameValid(lastname) &&
  isPasswordValid(password) &&
  isMobileNumberValid(mobile) &&
  isEmailValid(email)
);
