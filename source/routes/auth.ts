import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router()

const authController = new AuthController();

router.post('/signup', authController.signup)

router.post('/signin', authController.signin)

router.put('/change', authController.change)

router.post('/me', (req, res) => {
    res.status(200).json({ mensagem: "It's me!" })
})

export default router