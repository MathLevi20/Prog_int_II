import { NextFunction, Request, Response } from "express"
const jwt = require('jsonwebtoken');
var RSA = "Olá"

export function checkToken(request: Request, response: Response, next: NextFunction) {
    const authtoken = request.headers.authorization

    if (!authtoken) {
        return response.status(401).json({ msg: "Token is missing." })
    }

    const [typeAuth, token] = authtoken.split(' ')

    try {
        jwt.verify(token, RSA)

        return next()

    } catch (err) {
        return response.status(401).json({ msg: "Invalid token." })
    }

}

