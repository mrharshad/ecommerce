import { Model, Schema, model, models } from "mongoose";
import IAdditionalInfo from "../interfaces/additionalInfo";
const Structure = new Schema<IAdditionalInfo>({
  _id: String,
  lastProductId: Number,
  lastOrderId: Number,
  lastUserId: Number,
  nonDeletedImg: [{ _id: Date, nonDIPName: String, publicId: [] }],
  nonDeletedProImg: [String],
  contactUs: [
    {
      name: String,
      mailId: String,
      topic: String,
      text: String,
      sendAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

const AdditionalInfo: Model<IAdditionalInfo> =
  models.AdditionalInfo || model<IAdditionalInfo>("AdditionalInfo", Structure);

export default AdditionalInfo;

export const docId = { _id: "additionalInfo" };
