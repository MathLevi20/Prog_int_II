import { NextFunction, Request, Response } from "express"
import { db } from "../data/mongo/MongoDatabase"
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
var RSA = "Olá"

interface User {
    id?: string
    name: string
    email: string
    password: string
}
export function verifyJWT(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["x-acess-token"]
    const refresh_token = req.headers["x-ref-token"]
    jwt.verify(token, RSA, (err: Error, decoded: any) => {
        if (err) {
            jwt.verify(refresh_token, RSA, (err: Error, decoded: any) => {
                if (err)
                    return res.status(401).json({ "error": true, "message": 'Unauthorized access.' });
            })
        }
        else {
            return res.status(403).send({
                "error": true,
                "message": 'No token provided.'
            });
        }
        console.log(req)
        req = decoded.id
        next()
    }

    )
}
export class AuthController {
    private users

    constructor() {
        this.users = db.collection<User>('users')
    }

    public signup = async (req: Request, res: Response) => {
        var letter = /[a-zA-Z]/;
        var number = /[0-9]/;
        const { email, name, password, val_password: valid_password } = req.body
        const hash = await crypto.createHash('md5').update(password).digest('hex');
        console.log(hash)
        const foundUser = await this.users.findOne<User>({
            email
        })
        if (foundUser) {
            return res.status(409).json({ error: "Já existe um usuário com este email!" })
        }
        if (valid_password == password) {
            return res.status(401).json("As senhas não conferem")
        };
        if (password.length <= 6) {
            return res.status(401).json("a senha deve ter no mímimo 7 caracteres")
        };
        if (!number.test(password)) {
            return res.status(401).json("Certifique-se de que a senha inclui um dígito")
        }
        if (!letter.test(password)) {
            return res.status(401).json("Por favor, certifique-se de que a senha inclui um caractere maiúsculo e minúsculo")
        }
        // save into db
        const result = await this.users.insertOne({
            name: name,
            email: email,
            password: hash
        })
        return res.status(200).json(result)
    }

    public signin = async (req: Request, res: Response) => {
        const { email, password } = req.body
        console.log(password)
        const foundUser = await this.users.findOne<User>({
            email
        })
        const hash = await crypto.createHash('md5').update(password).digest('hex');
        console.log(hash)
        if (!foundUser) {
            return res.status(401).json({ error: "Usuário e/ou senha incorretos!" })
        }
        if (foundUser.password != hash) {
            return res.status(401).json({ error: "Senha Incorreta" })
        }
        console.log(foundUser.email)
        const token = jwt.sign({ "id": 2 }, RSA, { algorithm: "HS256", expiresIn: 1500 })
        const refresh_token = jwt.sign({ "id": 2 }, RSA, { algorithm: "HS256", expiresIn: 86400000 })

        const updateDoc = {
            $set: {
                "token": token,
                "refresh_token": refresh_token
            },
        };
        const result = await this.users.findOneAndUpdate({
            email: email
        }, updateDoc)
        return res.json({ result, auth: true, token: token })
    }


    public change = async (req: Request, res: Response) => {
        var { email, password, change_password } = req.body
        var password = await crypto.createHash('md5').update(password).digest('hex');
        const password_change = await crypto.createHash('md5').update(change_password).digest('hex');
        var letter = /[a-zA-Z]/;
        var number = /[0-9]/;

        var foundUser_email = await this.users.findOne({ email });
        console.log(foundUser_email)
        if (foundUser_email == null) {
            return res.status(401).json("Usuario não encontrado")
        }
        if (change_password.length <= 6) {
            return res.status(401).json("a senha deve ter no mímimo 7 caracteres")
        };
        if (password == password_change) {
            return res.status(401).json("Insira uma senha diferente")
        }
        if (!number.test(change_password)) {
            return res.status(401).json("Certifique-se de que a senha inclui um dígito")
        }
        if (!letter.test(change_password)) {
            return res.status(401).json("Por favor, certifique-se de que a senha inclui um caractere maiúsculo e minúsculo")
        }

        const updateDoc = {
            "$set": {
                "password": password_change
            },
        };
        var foundUser = await this.users.findOneAndUpdate({ email, password }, updateDoc);
        return res.status(200).json(foundUser)
    }


}