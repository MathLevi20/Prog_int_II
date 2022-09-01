
import { NextFunction, Request, Response } from "express"
const jwt = require('jsonwebtoken');
var RSA = "Olá"

const genrateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function checkToken(request: Request, response: Response, next: NextFunction) {
    const authtoken = request.headers.authorization
    console.log(authtoken)
    if (!authtoken) {
        return response.status(401).json({ msg: "Token is missing." })
    }

    const [typeAuth, token] = authtoken.split(' ')
    console.log(typeAuth)
    try {
        jwt.verify(token, RSA)
        return next()

    } catch (err) {
        return response.status(401).json({ msg: "Invalid token." })
    }

}

