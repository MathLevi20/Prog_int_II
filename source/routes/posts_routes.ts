import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/auth_middleware'

const postRoutes = Router()
const nome = 'Rogerio'

postRoutes.use(AuthMiddleware)

postRoutes.get('/', (req, res) => res.json({ posts: [] }))
postRoutes.post('/', (req, res) => res.status(201).json({ post: { id: 1, titule: 'Meu Post' } }))
postRoutes.post('/refreshtoken', AuthMiddleware)

export { postRoutes, nome }

