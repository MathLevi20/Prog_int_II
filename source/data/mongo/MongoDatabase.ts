import { Db, MongoClient } from "mongodb"
const mongoose = require("mongoose")

class MongoDatabase{

    private client: MongoClient
    private db: Db

    constructor(){
        const uri = "mongodb+srv://matheuslevi:12345@cluster0.w6qg0n5.mongodb.net/?retryWrites=true&w=majority";

        this.client = new MongoClient(uri)
        this.db = this.client.db('socialapp')
    }

    public getInstance(){
        return this.db
    }

}

const db = new MongoDatabase().getInstance()

export { db }





