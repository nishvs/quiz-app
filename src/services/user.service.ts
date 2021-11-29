import User from "../Models/User.model";
import mongoose from "mongoose";
import { ResponseError } from "../types/ResponseError";

export class UserService {
  
  constructor(){
  }

  public create = async (user:{email:string,password:string}) => {
    //Implement hashing for password
    const doesExist = await User.findOne({email:user.email});
    if(doesExist){
      const duplicateError:ResponseError = new Error("Account for email alaready exists");
      duplicateError.status = 409;
      throw duplicateError;
    }
    return await new User(user).save();
  }

  public check = async (user:{email:string,password:string}) => {
    const foundUser = await User.findOne(user);
    return foundUser;
  }
  public updateStats = async (userid:string,score:number) => {
    let user = await this.getUser(userid,{});
    if(user){
      user.score += score;
      user.attempts += 1;
      return user.save();
    }
    return null;
  }
  private getUser = async (userid:string,fields:any) =>{
    const filterQuery:mongoose.FilterQuery<User> = { _id: new mongoose.Types.ObjectId(userid) };
    return await User.findOne(filterQuery,fields);
  } 
  public getTestStats = async (userid:string) => {
    return await this.getUser(userid,{score:1,attempts:1,_id:0});
  }
}