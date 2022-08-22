import { Router } from 'express'

const suelRoutesOffLine = Router()

const feed = 'feed'

suelRoutesOffLine.get('/feed', (req, res)=>{
    res.json({feed})}
)

export default suelRoutesOffLine