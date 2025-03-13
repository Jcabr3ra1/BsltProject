import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor() {}

  handleError(error: Error | HttpErrorResponse): void {
    console.error('=== Global Error Handler ===');
    
    if (error instanceof HttpErrorResponse) {
      // Error de servidor o red
      console.error('Backend returned status code:', error.status);
      console.error('Response body:', error.error);
      console.error('Headers:', error.headers);
      console.error('URL:', error.url);
      
      if (error.error instanceof Error) {
        // Error de cliente (red)
        console.error('Client-side error:', error.error.message);
      } else {
        // Error de servidor
        console.error('Server-side error:', error.message);
      }
    } else {
      // Error de cliente (JavaScript)
      console.error('Client Error:', error);
      console.error('Stack Trace:', error.stack);
    }
    
    console.error('=== End of Global Error Handler ===');
  }
}
