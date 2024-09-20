import cloudinaryConfig from "../config/cloudinaryConnect";
import { IDeleteResourcesResponse } from "../interfaces/cloudinary";
import AdditionalInfo, { docId } from "../models/additionalInfo";
import { numStrNum } from "./dateFormatters";

export async function multipleImageDelete(public_ids: Array<string>) {
  const deleteImgs = (await cloudinaryConfig.api.delete_resources(
    public_ids
  )) as IDeleteResourcesResponse;

  const notDeletedImg = [];
  const deletedObj = deleteImgs.deleted;
  for (let i in deletedObj) {
    if (deletedObj[i] !== "deleted") {
      notDeletedImg.push(i);
    }
  }
  if (notDeletedImg.length) {
    const updateAdditionalInfo = await AdditionalInfo.updateOne(docId, {
      $push: {
        nonDeletedProImg: notDeletedImg,
      },
    });
    if (updateAdditionalInfo.modifiedCount !== 1) {
      throw new Error(
        "images that could not be deleted could not be stored in the database either."
      );
    }
  }
}
