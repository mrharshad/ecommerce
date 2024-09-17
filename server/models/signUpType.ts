export default interface ISignUp {
  _id: string;
  token: string;
  reTry: Date;
  numOfSendToken: number;
}
