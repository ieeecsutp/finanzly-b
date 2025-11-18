import { body, ValidationChain } from "express-validator";

export function resetPasswordRq(): ValidationChain[] {
  return [
    body("token")
      .notEmpty()
      .withMessage("El token es requerido")
      .isString()
      .withMessage("El token debe ser una cadena de texto"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("La contraseña debe tener al menos 8 caracteres")
      .matches(/[A-Z]/)
      .withMessage("La contraseña debe contener al menos una mayúscula")
      .matches(/[0-9]/)
      .withMessage("La contraseña debe contener al menos un número"),
    body("confirmPassword")
      .notEmpty()
      .withMessage("La confirmación de contraseña es requerida")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Las contraseñas no coinciden");
        }
        return true;
      }),
  ];
}
