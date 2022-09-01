import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/auth_middleware'
import { checkToken } from '../middlewares/verify_token'
import { verifyJWT } from '../controllers/AuthController'

const postRoutes = Router()
const nome = 'Rogerio'

postRoutes.use(AuthMiddleware)

postRoutes.get('/', checkToken, (req, res) => res.json({ posts: [] }))
postRoutes.post('/', checkToken, (req, res) => res.status(201).json({ post: { id: 1, titule: 'Meu Post' } }))

export { postRoutes, nome }

