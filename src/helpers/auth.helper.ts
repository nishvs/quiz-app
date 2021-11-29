import  jwt, { SignOptions }  from "jsonwebtoken";

export class AuthHelper {
    public generateToken = (id:string) => {
        return new Promise((resolve,reject)=>{
            const payload = {}
            if(!process.env.TOKEN_SECRET){
                throw new Error("Token secret not available in ENV");
            }
            const secret = process.env.TOKEN_SECRET;
            const options:SignOptions = { expiresIn: "5h", audience: id.toString() }
            jwt.sign(payload,secret,options,(err:Error | null ,token:string| undefined)=>{
                if(err) reject(err)
                resolve(token);                
            })
        })
    }
    public verifyToken = (token:string) => {
        return new Promise((resolve,reject)=>{
            const payload = {}
            if(!process.env.TOKEN_SECRET){
                throw new Error("Token secret not available in ENV");
            }
            const secret = process.env.TOKEN_SECRET;
            jwt.verify(token,secret,(err,payload)=>{
                if(err){
                    reject(err);
                }
                resolve(payload);
            });
        })
    }
}