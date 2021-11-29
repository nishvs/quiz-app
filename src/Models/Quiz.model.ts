import mongoose, { Schema, Document, ObjectId, model } from 'mongoose';
import { IQuiz } from "../types/Quiz"

const QuizSchema = new Schema<IQuiz>({
    question: {
        type:String,
        required:true,
    },
    answer: {
        type:String,
        required:true        
    },
    number: {
        type:Number       
    },
    mark: {
        type:Number,
        required:true
    },
    masterid: {
        type: mongoose.Schema.Types.ObjectId
    },
})

const Quiz = model<IQuiz>('quiz',QuizSchema)

export default Quiz;