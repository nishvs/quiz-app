import mongoose, { MongooseOptions } from "mongoose";

export class Mongo {
    public createConnection = async () => {
        try{
            console.log(this.buildConnectionString());
            await mongoose.connect(this.buildConnectionString());
        }catch(err){
            console.log(err);
        }
    }
    private buildConnectionString = () => {
        const username = process.env.MONGO_USER || '';
        const password = process.env.MONGO_PASS || '';
        const host = process.env.MONGO_HOST || '';
        const db = process.env.MONGO_DBNAME || '';
        let connectionUrl = 'mongodb://';
        if(username){
            connectionUrl += username
        }
        if(password){
            connectionUrl += `:${password}`;
        }
        connectionUrl += `${host}/${db}`;
        return connectionUrl;
    }
}