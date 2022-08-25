import { Request, Response } from "express"
import { db } from "../data/mongo/MongoDatabase"
var crypto = require('crypto');
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

interface User {
    id?: string
    name: string
    email: string
    password: string
}
function hash(params: any) {

}
export class AuthController {
    private users

    constructor() {
        this.users = db.collection<User>('users')
    }

    public signup = async (req: Request, res: Response) => {

        const { email, name, password } = req.body

        const users = { email, name, password }
        const hash = await crypto.createHash('md5').update(password).digest('hex');
        console.log(hash)
        const foundUser = await this.users.findOne<User>({
            email
        })

        if (foundUser) {
            return res.status(409).json({ error: "Já existe um usuário com este email!" })
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
        console.log(test)
        if (!foundUser) {
            return res.status(401).json({ error: "Usuário e/ou senha incorretos!" })
        }
        if (foundUser.password != hash) {
            return res.status(401).json({ error: "Senha Incorreta" })
        }
        const token = jwt.sign({ 1: Number }, process.env.SECRET, {
            expiresIn: 300 // expires in 5min
        });
        return res.json({ auth: true, token: token });

        return res.status(200).json(foundUser)

    }

    public change = async (req: Request, res: Response) => {
        const { email, password, change_password } = req.body
        const password_hash = await crypto.createHash('md5').update(password).digest('hex');
        const password_change = await crypto.createHash('md5').update(change_password).digest('hex');

        const updateDoc = {
            $set: {
                "password": password_change
            },
        };
        var foundUser = await this.users.findOneAndUpdate({ email, password_hash }, updateDoc)

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