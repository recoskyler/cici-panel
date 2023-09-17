import type { PopupSettings } from '@skeletonlabs/skeleton';

export const passwordPopupFocusBlur: PopupSettings = {
  event: 'focus-blur',
  target: 'popupFocusBlur',
  placement: 'top',
};

export const passwordStrengthLevels = [
  'password-strength.super-weak',
  'password-strength.very-weak',
  'password-strength.weak',
  'password-strength.strong',
  'password-strength.very-strong',
];

export const passwordStrengthColorLevels = [
  'text-red-600',
  'text-red-500',
  'text-orange-500 dark:text-orange-400',
  'text-green-600 dark:text-green-300',
  'text-green-700 dark:text-green-500',
];
