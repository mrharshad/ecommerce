import { IAlert } from "@/interfaces/userClientSide";
import { ICertificates, IImageSets, INewProUpdate } from "../interface";

export interface INewSet {
  imageSets: IImageSets[];
  showAlert: (obj: IAlert) => void;
  newProKeyFunc: (obj: INewProUpdate[]) => void;
  uniqueSelectedImages: (file: File[]) => Promise<string[]>;
}

export interface ICertificatesProps {
  certificates: ICertificates[];
  newProKeyFunc: (obj: INewProUpdate[]) => void;
  deleteCertificate: (name: string) => void;
  showAlert: (obj: IAlert) => void;
  loadImage: (file: File) => Promise<string>;
}
