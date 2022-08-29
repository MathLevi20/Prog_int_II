import { NextFunction, Request, Response } from "express"
import { db } from "../data/mongo/MongoDatabase"
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
var RSA = require("dotenv").config({ path: "./.env" })

interface User {
    id?: string
    name: string
    email: string
    password: string
}
export function verityJTM(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["x-acess-token"]
    jwt.verify(token, 'abc', (err: Error, decoded: any) => {
        if (err) return res.status(401).end()
        console.log(req)
        req = decoded.id
        next()
    })
}
export class AuthController {
    private users

    constructor() {
        this.users = db.collection<User>('users')
    }

    public signup = async (req: Request, res: Response) => {
        var letter = /[a-zA-Z]/;
        var number = /[0-9]/;
        const { email, name, password, val_password } = req.body
        const hash = await crypto.createHash('md5').update(password).digest('hex');
        console.log(hash)
        const foundUser = await this.users.findOne<User>({
            email
        })
        if (foundUser) {
            return res.status(409).json({ error: "Já existe um usuário com este email!" })
        }
        if (val_password == password) {
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
        console.log(foundUser?.password)
        const hash = await crypto.createHash('md5').update(password).digest('hex');
        const test = await foundUser?.password
        console.log(hash)
        if (!foundUser) {
            return res.status(401).json({ error: "Usuário e/ou senha incorretos!" })
        }
        if (foundUser.password != hash) {
            return res.status(401).json({ error: "Senha Incorreta" })
        }

        const token = jwt.sign({ "id": foundUser.id }, RSA.parsed.SECRET, {
            expiresIn: 300 // expires in 5min
        });
        const updateDoc = {
            $set: {
                "token": token
            },
        };
        const result = await this.users.findOneAndUpdate({
            email: email
        }, updateDoc)
        return res.json({ result, auth: true, token: token })
        return res.status(200).json(foundUser)
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
        console.log(typeof foundUser)
        console.log(password)
        console.log(updateDoc)

        /*const token = jwt.sign({"_id"*/
        return res.status(200).json(foundUser)
    }
    /* public signin = async (req: Request, res: Response) => {
          await db.sync();
          const {email, password} = req.body
          var hash = crypto.createHash('md5').update(password + "uwu").digest('hex');
          const foundUser = await User.findOne({
              where: {
                  email: email
              }
          })
          if(foundUser == null){
              return res.status(400).json("usuário não encontrado")
          }
          if(foundUser.password != hash){
              return res.status(401).json("senha incorreta")
          }
          
          const token = jwt.sign({"id": foundUser.id}, secret, {expiresIn: 900})
          return res.status(200).json({
              auth : true,
              token
          })
      }*/

}