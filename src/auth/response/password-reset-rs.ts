export interface ForgotPasswordRs {
  message: string;
  // En entorno de desarrollo o cuando el backend no pueda enviar email,
  // retornamos opcionalmente el token y la url para facilitar pruebas.
  token?: string;
  resetUrl?: string;
}

export interface ResetPasswordRs {
  message: string;
}
