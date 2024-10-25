export interface IContactUs {
  name: string;
  mailId: string;
  topic: string;
  text: string;
  sendAt: Date;
}
export default interface IAdditionalInfo {
  _id: number;
  lastProductId: number;
  lastOrderId: number;
  lastUserId: number;
  nonDeletedImg: number;
  nonDeletedProImg: Array<string>;
  contactUs: IContactUs[];
}
