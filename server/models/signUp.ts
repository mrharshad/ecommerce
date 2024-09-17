import { Model, Schema, model, models } from "mongoose";
// const validator = require("validator");
import ISignUp from "./signUpType";
const Structure = new Schema<ISignUp>({
  _id: String,
  token: String,
  reTry: Date,
  numOfSendToken: Number,
});

const SignUp: Model<ISignUp> =
  models.SignUp || model<ISignUp>("SignUp", Structure);

export default SignUp;
