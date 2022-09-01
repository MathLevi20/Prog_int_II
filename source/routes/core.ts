import { Router } from 'express'
import { verifyJWT } from '../controllers/AuthController'

const suelRoutesOffLine = Router()

const feed = 'feed'

suelRoutesOffLine.get('/feed', verifyJWT, (req, res) => {
    res.json({ feed })
}
)

export default suelRoutesOffLine