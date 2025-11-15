import { Router } from "express";
import authController from "../auth/auth.controller";
import usuarioController from "../usuario/usuario.controller";
import registroController from "../registro/registro.controller";
import categoriaController from "../categoria/categoria.controller";
import refreshController from "../refresh/refresh.controller";

const router = Router();

router.use("/auth", authController)
router.use("/usuarios", usuarioController);
router.use("/registros", registroController);
router.use("/categorias", categoriaController);
router.use("/refresh", refreshController);

export default router;