import mongoose, { Schema, Document, ObjectId, model } from 'mongoose';

export interface IQuiz{
    question: string;
    answer: string;
    number?:number;
    mark:number;
    masterid: mongoose.Types.ObjectId;
}