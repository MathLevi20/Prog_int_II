import { NextFunction, Request, Response } from "express"
var ObjectId = require('mongodb').ObjectID;
import { db } from "../data/mongo/MongoDatabase"
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
var RSA = "Olá"

interface User {
    _id?: string
    name: string
    email: string
    tel: number
    password: string
    cod_email: string
    cod_tel: string
    valid_email?: boolean
    valid_tel?: boolean
    valid_acc: any
}

const genrateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export class AuthController {
    private users
    constructor() {
        this.users = db.collection<User>('users')
    }

    public signup = async (req: Request, res: Response) => {
        var letter = /[a-zA-Z]/;
        var number = /[0-9]/;
        const { email, name, password, val_password: valid_password, telefone } = req.body
        const hash = await crypto.createHash('md5').update(password).digest('hex');
        console.log(hash)
        const foundUser = await this.users.findOne<User>({
            email
        })
        console.log(foundUser)
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
        const gerar_tel = genrateRandomNumber(10000, 90000)
        const gerar_email = genrateRandomNumber(10000, 90000)
        console.log(gerar_tel)
        console.log(gerar_email)
        const cod_tel = jwt.sign({ "opt_tel": gerar_tel }, RSA, { algorithm: "HS256", expiresIn: "2h" })
        const cod_email = jwt.sign({ "opt_mail": gerar_email }, RSA, { algorithm: "HS256", expiresIn: "2h" })
        const valid = false
        const result = await this.users.insertOne({
            name: name,
            email: email,
            password: hash,
            tel: telefone,
            cod_email: cod_email,
            cod_tel: cod_tel,
            valid_acc: valid
        })

        return res.status(200).json(result)
    }

    public signin = async (req: Request, res: Response) => {
        const { email, password } = req.body
        const foundUser = await this.users.findOne<User>({
            email
        })
        const hash = await crypto.createHash('md5').update(password).digest('hex');
        if (!foundUser) {
            return res.status(401).json({ error: "Usuário e/ou senha incorretos!" })
        }

        if (foundUser.password != hash) {
            return res.status(401).json({ error: "Senha Incorreta" })
        }

        if (foundUser.valid_tel != true) {
            return res.status(401).json({ msg: "Senha tel Incorreta" })
        }
        if (foundUser.valid_email != true) {
            return res.status(401).json({ msg: "Senha email Incorreta" })
        }

        if (foundUser.valid_acc == true) {
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

    public email = async (req: Request, res: Response, next: NextFunction) => {
        var { id, cod_email } = req.body
        var foundUser_email = await this.users.findOne({ _id: new ObjectId(id) });
        console.log(req.body)
        if (foundUser_email == null) {
            return res.status(401).json("Usuario não encontrado")
        }

        if (foundUser_email == null) {
            return res.status(401).json("Usuario não encontrado")
        }

        const token = foundUser_email.cod_email
        const cod = cod_email
        try {
            var jwt1 = jwt.verify(token, RSA)
            console.log(jwt1.opt_mail)
            console.log(cod)
            if (jwt1.opt_mail == cod) {

                const updateDoc = {
                    "$set": {
                        "valid_email": true
                    }
                };
                const result = await this.users.findOneAndUpdate(
                    { _id: new ObjectId(id) }
                    , updateDoc)

                return res.status(201).json({ msg: "Autorizado" })
            }
            else {
                return res.status(401).json({ msg: "Invalid" })
            }
        } catch (err) {
            return res.status(401).json({ msg: "Invalid token." })
        }
    }

    public tel = async (req: Request, res: Response, next: NextFunction) => {
        var { tel, cod_tel } = req.body
        var foundUser_email = await this.users.findOne({ tel });
        console.log(req.body)
        console.log(foundUser_email)
        if (foundUser_email == null) {
            return res.status(401).json("Usuario não encontrado")
        }

        if (foundUser_email == null) {
            return res.status(401).json("Usuario não encontrado")
        }
        const token = foundUser_email.cod_tel
        const cod = parseInt(cod_tel)

        try {
            var jwt1 = jwt.verify(token, RSA)
            console.log(typeof (jwt1.opt_tel))
            console.log((jwt1.opt_tel))
            console.log(typeof (cod))
            console.log((cod))
            if (jwt1.opt_tel === cod) {

                const updateDoc = {
                    "$set": {
                        "valid_tel": true
                    }
                };
                const result = await this.users.findOneAndUpdate(
                    { tel }
                    , updateDoc)
                return res.status(201).json({ msg: "Autorizado" })
            }
            else {
                return res.status(401).json({ msg: "Invalid" })
            }
        } catch (err) {
            return res.status(401).json({ msg: "Invalid token." })
        }
    }



}
