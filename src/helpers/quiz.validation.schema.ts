import Joi from "joi";

const question = Joi.object().keys({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    mark: Joi.number().required()
  })

const quizSchema = Joi.object({
    quiz: Joi.array().required().min(1).items(question)
})

const answers = Joi.object().keys({
  answer: Joi.string().required(),
  number: Joi.number().required()
})

const testSchema = Joi.object({
  quizid: Joi.string().min(24).required(),
  test: Joi.array().required().min(1).items(answers)
})

const headerSchema = Joi.string().required().min(7)

export { quizSchema,headerSchema,testSchema };