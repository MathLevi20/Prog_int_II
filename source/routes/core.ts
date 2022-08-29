import { Router } from 'express'
import { verityJTM } from '../controllers/AuthController'

const suelRoutesOffLine = Router()

const feed = 'feed'

suelRoutesOffLine.get('/feed', verityJTM, (req, res) => {
    res.json({ feed })
}
)

export default suelRoutesOffLine