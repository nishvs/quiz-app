import { Router, Response, Request, NextFunction } from "express";
import { QuizService } from "../services/quiz.service";
import { ApiResponse } from "./response";
import { quizSchema,headerSchema } from "../helpers/quiz.validation.schema"
import { AuthHelper } from "../helpers/auth.helper"
import { ResponseError } from "../types/ResponseError";
import { IQuiz } from "../types/Quiz";

export class QuizController {
  public router: Router;
  // private taskService: TaskService; 
  private quizService: QuizService; 
  private authHelper: AuthHelper; 

  constructor(_quizService:QuizService,_authHelper:AuthHelper){
    this.quizService = _quizService; // Create a new instance of TaskController
    this.authHelper = _authHelper;
    this.router = Router();
    this.routes();
  }

  private prepareAndSentResponse = (req: Request, res: Response) => {
    const response = new ApiResponse(res.locals.data, res.locals.processed).getResponseData();
    res.json(response);
  }

  private removeAndCreateQuiz = (req: Request, res: Response, next:NextFunction) => {
    //Pass req body to service function
    const response = this.quizService.removeAndCreateQuiz(req.body.quiz as [IQuiz],res.locals.id)    
    res.locals.processed = true;
    next()
  }

  private validateRequest = async (req: Request, res: Response, next:NextFunction) => {
    //next()
    try{
      await headerSchema.validateAsync(req.headers.authorization);
      await quizSchema.validateAsync(req.body);
      next();
    }catch(error:any){
      if(error.isJoi === true) error.status = 422;
      next(error);
    }
  }
  private verifyToken = async (req: Request, res: Response, next:NextFunction) => {
    //Validated earlier
    const authHeader = req.headers.authorization!.split(' ')
    if(authHeader.length > 1){
      try{
        const p = <{ iat: number, exp: number, aud: string }>await this.authHelper.verifyToken(authHeader[1]);      
        res.locals.id = p.aud;
        next();
      }catch(err){
        const error:ResponseError = new Error("Unauthorized")
        error.status = 401
        next(error)
      }
    }else{
      const error:ResponseError = new Error("Unauthorized")
      error.status = 401
      next(error)
    }
  }
  
  public routes(){
    this.router.post('/', this.validateRequest , this.verifyToken, this.removeAndCreateQuiz, this.prepareAndSentResponse);
  }
}