import { Router, Response, Request, NextFunction } from "express";
import { QuizService } from "../services/quiz.service";
import { ApiResponse } from "./response";
import { headerSchema ,testSchema} from "../helpers/quiz.validation.schema"
import { AuthHelper } from "../helpers/auth.helper"
import { ResponseError } from "../types/ResponseError";
import { UserService } from "../services/user.service";

export class TestController {
  public router: Router;
  // private taskService: TaskService; 
  private quizService: QuizService; 
  private authHelper: AuthHelper; 
  private userService: UserService;

  constructor(_quizService:QuizService,_authHelper:AuthHelper,_userService:UserService){
    this.quizService = _quizService;
    this.userService = _userService;
    this.authHelper = _authHelper;
    this.router = Router();
    this.routes();
  }

  private prepareAndSentResponse = (req: Request, res: Response) => {
    const response = new ApiResponse(res.locals.data, res.locals.processed).getResponseData();
    res.json(response);
  }

  private getTest = async(req: Request, res: Response, next:NextFunction) => {
    res.locals.data = await this.quizService.getQuizForAttempts(res.locals.id);
    res.locals.processed = true;
    next();
  }

  private getTestStats = async(req: Request, res: Response, next:NextFunction) => {
    res.locals.data = await this.userService.getTestStats(res.locals.id)
    res.locals.processed = true;
    next();
  }

  private submitTest = async(req: Request, res: Response, next:NextFunction) => {
    const predefinedAnswers = await this.quizService.getAnswersForValuation(req.body.quizid);
    let score = 0;
    const submittedAnswerMap = new Map(req.body.test.map((item: { number: any; answer: any; }) => [item.number,item.answer]));
    for(let [number,answer] of submittedAnswerMap){
      const scored = predefinedAnswers.find((predefinedAnswer => (predefinedAnswer.number == number && predefinedAnswer.answer == answer )))
      if(scored)
        score = score + scored?.mark;
    }
    const isStatsUpdated = await this.userService.updateStats(res.locals.id,score)
    if(isStatsUpdated){
      res.locals.processed = true;
    }
    next();
  }

  private validateRequest = async (req: Request, res: Response, next:NextFunction) => {
    //next()
    try{
      await headerSchema.validateAsync(req.headers.authorization);
      if(req.method == "PUT"){
        await testSchema.validateAsync(req.body);
      }
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
    this.router.get('/', this.validateRequest , this.verifyToken, this.getTest, this.prepareAndSentResponse);
    this.router.put('/', this.validateRequest , this.verifyToken, this.submitTest, this.prepareAndSentResponse);
    this.router.get('/stats', this.validateRequest , this.verifyToken, this.getTestStats, this.prepareAndSentResponse);
  }
}