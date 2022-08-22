import { Router } from 'express'
import authRoutes from './auth'
import rotas from './core'
import { postRoutes } from './posts_routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/core', rotas)
router.use('/posts', postRoutes)

export default router