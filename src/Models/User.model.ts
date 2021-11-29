import { model, Schema } from "mongoose";

interface User {
    email: string;
    password: string;
    attempts:number;
    score:number;
  }

const UserSchema = new Schema<User>({
    email: {
        type:String,
        required:true,
        lowercase:true,
        unique:true
    },
    password: {
        type:String,
        required:true        
    },
    attempts: {
        type:Number,
        default:0        
    },
    score: {
        type:Number,
        default:0
    }
})

const User = model<User>('user',UserSchema)

export default User;