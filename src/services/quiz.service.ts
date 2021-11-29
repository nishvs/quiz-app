import mongoose, { Mongoose, Schema } from "mongoose";
import Quiz from "../Models/Quiz.model";
import { IQuiz } from "../types/Quiz";

export class QuizService {
  public removeAndCreateQuiz = async (quiz:[IQuiz],id:string) => {
    await Quiz.deleteMany({masterid:new mongoose.Types.ObjectId(id)});
    const bulkOps:any = []
    quiz.forEach((quizItem:IQuiz,index:number)=>{
      const insertItem = quizItem;
      insertItem.masterid = new mongoose.Types.ObjectId(id);
      insertItem.number = index + 1;
      const insertDoc = {
        insertOne: {
          document: insertItem
        }
      }
      bulkOps.push(insertDoc);
    })
    const mongoRes = await Quiz.collection.bulkWrite(bulkOps);
    if(mongoRes.result.ok == 1)
      return true;
    return false;
  }
  public getQuizForAttempts = async (id:string) => {
    //Aggregate on quiz
    const response = await Quiz.aggregate([
      { "$match": { "masterid": {"$ne": new mongoose.Types.ObjectId(id) } } },
      {
        "$group": {
          "_id": "$masterid",
          "quiz": {
              "$push": { 
                    "question": "$question",
                    "number": "$number",
                },
          }
        }
      }
    ])
    return response;
  }
  public getAnswersForValuation = async (id:string) => {
    const response = await Quiz.find({masterid:new mongoose.Types.ObjectId(id)},{answer:1,mark:1,number:1})
    return response;
  }


}