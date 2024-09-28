export interface IVariantOption {
  _id: string;
  mrp: number;
  loc: string[]; // state:district:quantity
}

export interface IVariant {
  _id: string;
  info: string;
  purchased: number; // discount
  discounts: Array<string>; // qty:discount;
  options: IVariantOption[];
  created: string; // 17-02-24
}
export interface IImages {
  _id: string;
  url: string;
}

export interface IReviews {
  // jo comment nhi kiya unka bhi info auto matic 4 rating set ho jaiga
  _id: number;
  name: string;
  state: string;
  district: string;
  rating: number; // automatic 4
  comment?: string;
  delivered: string; // delivered date
}
export interface IImage {
  _id: string;
  url: string;
}
export interface IImageSets {
  _id: string;
  images: Array<{ _id: string; url: string }>;
  created: string;
}

// export interface IThumbnail {
//   url: string;
//   _id: string;
//   update: string; // 17-02-24
// }
interface ICertificates {
  _id: string;
  // publicId: string;
  image: string;
  added: string; //17-02-24
  verified: boolean;
}
export interface ISearchProduct {
  _id: number;
  name: string; // length = min:10 max:75
  brand: string; // length = min:2 max:20
  tOfP: string /* length = min:2 max:20
   Men: Football Shoes / sabse pahale kiske liye hai agar sabhi ke liye hai to sirf Football Shoes */;
  category: string; // length = min:2 max:20
  rating: number;
  sold: number;
  exInfo: string[]; // key:value
  thumbnail: string;
  popular?: number;
  price: number;
  discount: number;
  mrp: string;
}
export interface ISingleProduct extends ISearchProduct {
  imgSetKey: string; // length = max:15
  imageSets: Array<{
    _id: string;
    images: Array<{ _id: string; url: string }>;
    created: string;
  }>;
  variantKey: string;
  variants: Array<{
    _id: string;
    info: string;
    purchased: number;
    discounts: Array<string>;
    options: Array<{
      _id: string;
      mrp: number;
      loc: string[];
    }>;
    created: string;
  }>;

  description: string;
  certificates: [
    {
      _id: string;
      image: string;
      added: string;
      verified: boolean;
    }
  ];

  ratings: Array<number>;
  reviews: Array<{
    _id: number;
    name: string;
    state: string;
    district: string;
    rating: number;
    comment?: string;
    delivered: string;
  }>;
  popular: number;
  createdAt: Date;
}

export interface IDBProduct extends ISingleProduct {}
