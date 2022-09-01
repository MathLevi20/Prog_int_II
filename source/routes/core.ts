import { Router } from 'express'
import { checkToken } from '../middlewares/verify_token'

const suelRoutesOffLine = Router()

const feed = 'feed'

suelRoutesOffLine.get('/feed', checkToken, (req, res) => {
    res.json({ feed })
}
)

export default suelRoutesOffLine