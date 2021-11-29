import express, {NextFunction, Request, Response} from 'express';
import { AuthController } from './controller/auth.controller';
import { QuizController } from './controller/quiz.controller';
import { TestController } from './controller/test.controller';
import { AuthHelper } from './helpers/auth.helper';
import { Mongo } from './database/mongo';
import dotenv from 'dotenv'
import { UserService } from './services/user.service';
import { QuizService } from './services/quiz.service';
import { ResponseError } from './types/ResponseError'

class Server {
  private quizController: QuizController;
  private authController: AuthController;
  private testController: TestController;
  private authHelper: AuthHelper
  private app: express.Application;

  constructor(authController:AuthController,quizController:QuizController,testController:TestController){
    this.authController = authController;
    this.quizController = quizController;
    this.testController = testController;
    this.app = express(); // init the application
    this.configuration();
    this.routes();
  }

  /**
   * Method to configure the server,
   * If we didn't configure the port into the environment 
   * variables it takes the default port 3000
   */
  public configuration() {
    this.app.set('port', process.env.PORT || 3000);
    this.app.use(express.json());
  }

  /**
   * Method to configure the routes
   */
  public async routes(){

    this.app.get( "/", (req: Request, res: Response ) => {
      res.send( "Test request" );
    });

    this.app.use(`/api/v1/`,this.authController.router); // Configure the new routes of the controller post
    this.app.use(`/api/v1/quiz`,this.quizController.router);
    this.app.use(`/api/v1/test`,this.testController.router);

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const error:ResponseError = new Error("Not Found");
      error.status = 404;
      next(error);
    });

    this.app.use((error:ResponseError, req: Request, res: Response, next: NextFunction) => {
      res.status(error.status || 500);
      res.json({
        error:{ status:error.status, message: error.message}
      });
    });
  }

  public start(){
    process.on('uncaughtException', function(error) {
      console.log(error);
      process.exit(1)
    });
    process.on('unhandledRejection', function(reason){
      console.log(reason);
   });
    this.app.listen(this.app.get('port'), () => {
      console.log(`Server is listening ${this.app.get('port')} port.`);
    });
  }
}

const init = async () => {
  dotenv.config();
  await new Mongo().createConnection();
  const server = new Server(new AuthController(new UserService(),new AuthHelper()),new QuizController(new QuizService(),new AuthHelper()),new TestController(new QuizService(),new AuthHelper(),new UserService())); // Create server instance
  server.start(); // Execute the server
}

init();
