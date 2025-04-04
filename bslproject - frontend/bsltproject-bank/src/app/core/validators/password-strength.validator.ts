import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validator for password strength
 * Ensures password meets security requirements
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
    const hasMinLength = value.length >= 8;
    
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && 
                          hasSpecialChar && hasMinLength;
    
    return !passwordValid ? { passwordStrength: true } : null;
  };
}

/**
 * Helper function to get detailed password validation errors
 * Returns an object with specific validation errors
 */
export function getPasswordValidationErrors(control: AbstractControl): { [key: string]: boolean } {
  const value = control.value;
  
  if (!value) {
    return {};
  }

  const errors: { [key: string]: boolean } = {};
  
  if (!/[A-Z]+/.test(value)) {
    errors['upperCase'] = true;
  }
  
  if (!/[a-z]+/.test(value)) {
    errors['lowerCase'] = true;
  }
  
  if (!/[0-9]+/.test(value)) {
    errors['numeric'] = true;
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
    errors['specialChar'] = true;
  }
  
  if (value.length < 8) {
    errors['minLength'] = true;
  }
  
  return errors;
}
