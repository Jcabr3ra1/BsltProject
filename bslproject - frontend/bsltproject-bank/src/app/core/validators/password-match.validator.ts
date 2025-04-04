import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator to ensure password and confirm password fields match
 * @param control Form group containing password fields
 * @returns ValidationErrors if passwords don't match, null otherwise
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}
