import { Router, Response, Request, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { ApiResponse } from "./response";
import { userSchema } from "../helpers/user.validation.schema"
import { AuthHelper } from "../helpers/auth.helper"

export class AuthController {
  public router: Router;
  // private taskService: TaskService; 
  private userService: UserService; 
  private authHelper: AuthHelper; 

  constructor(_userService:UserService,_authHelper:AuthHelper){
    // this.taskService = _taskService; // Create a new instance of TaskController
    this.userService = _userService; // Create a new instance of TaskController
    this.authHelper = _authHelper;
    this.router = Router();
    this.routes();
  }

  private prepareAndSentResponse = (req: Request, res: Response) => {
    const response = new ApiResponse(res.locals.data, res.locals.processed).getResponseData();
    res.json(response);
  }

  private createUser = async(req: Request, res: Response, next:NextFunction) => {
    //Create User record and send success
    const user = {email:req.body.email,password:req.body.password}
    try{
      const savedUser = await this.userService.create(user);
      res.locals.processed = true;
      next()
    }catch(err){
      next(err);
    }
  }

  private validateRequest = async (req: Request, res: Response, next:NextFunction) => {
    try{
      await userSchema.validateAsync(req.body);
      next();
    }catch(error:any){
      if(error.isJoi === true) error.status = 422;
      next(error);
    }
  }

  private loginUser = async (req: Request, res: Response, next:NextFunction) => {
    //check if value exists in DB
    //Generate jwt token with user id in claims aud
    const user = {email:req.body.email,password:req.body.password}
    const foundUser = await this.userService.check(user);
    if(foundUser){
      res.locals.data = {} 
      res.locals.data.token = await this.authHelper.generateToken(foundUser._id);
      res.locals.processed = true;
      next()
    }else{
      res.locals.processed = true;
      next()
    }
  }
  
  public routes(){
    this.router.post('/register', this.validateRequest , this.createUser, this.prepareAndSentResponse);
    this.router.post('/login',this.validateRequest , this.loginUser, this.prepareAndSentResponse);
  }
}