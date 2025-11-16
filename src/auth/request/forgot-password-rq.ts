import { body, ValidationChain } from "express-validator";

export function forgotPasswordRq(): ValidationChain[] {
  return [
    body("correo")
      .isEmail()
      .withMessage("El correo debe ser válido")
      .trim()
      .normalizeEmail(),
  ];
}
