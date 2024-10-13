import {
  faceCare,
  hairCare,
  athletic,
  chess,
  badminton,
  fitness,
  showpiece,
  bodyCare,
} from "./commonExInfoData";
export interface IExInfoData {
  key: string;
  required: boolean;
  sameOrder?: boolean;
}
export interface ITypeOfProducts {
  tOfPName: string;
  requiredCertificates: Array<string>;
  exInfoData: Array<{ key: string; required: boolean; sameOrder?: boolean }>;
}
export interface ICategoriesInfo {
  _id: string;
  brands: Array<string>;
  tOfProducts: Array<{
    tOfPName: string;
    requiredCertificates: Array<string>;
    exInfoData: Array<{ key: string; required: boolean; sameOrder?: boolean }>;
  }>;
}

const categoriesInfo: Array<ICategoriesInfo> = [
  {
    _id: "Accessories",
    brands: [
      "NA",
      "Blue Beads",
      "GLUN",
      "Global Grabbers",
      "Hindustan Foam",
      "Puma",
      "Wesley",
    ],
    tOfProducts: [
      {
        tOfPName: "College Bag",
        requiredCertificates: [],
        exInfoData: [
          { key: "Material", required: true, sameOrder: true },
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
          { key: "Net Quantity", required: false, sameOrder: true },
        ],
      },
      {
        tOfPName: "Cap",
        requiredCertificates: [],
        exInfoData: [
          { key: "Net Quantity", required: false, sameOrder: true },
          { key: "Container Type", required: false },
        ],
      },
      {
        tOfPName: "Keychain",
        requiredCertificates: [],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
          { key: "Net Quantity", required: false, sameOrder: true },
        ],
      },
      {
        tOfPName: "Wallets",
        requiredCertificates: [],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
        ],
      },
    ],
  },
  {
    _id: "Athletic",
    brands: ["NA", "Vector X", "BLACK PANTHER", "Nivia"],
    tOfProducts: [
      {
        tOfPName: "Sport A-L Socks",
        exInfoData: [
          { key: "Material", required: true, sameOrder: true },
          ...athletic,
        ],
        requiredCertificates: [],
      },
      {
        tOfPName: "Sport K-L Socks",
        exInfoData: [...athletic],
        requiredCertificates: [],
      },
      {
        tOfPName: "Marker Cones",
        exInfoData: [
          { key: "Material", required: true, sameOrder: true },
          ...athletic,
        ],
        requiredCertificates: [],
      },
      {
        tOfPName: "Disc Cone",
        requiredCertificates: [],
        exInfoData: [...athletic],
      },
      {
        tOfPName: "Ankle Support",
        requiredCertificates: [],
        exInfoData: [
          { key: "Material", required: true, sameOrder: true },
          { key: "Product Care", required: true, sameOrder: true },
          { key: "Dimensions ", required: true, sameOrder: true },
          ...athletic,
        ],
      },
      {
        tOfPName: "Knee Support",
        exInfoData: [
          { key: "Product Care", required: true, sameOrder: true },
          { key: "Closure Type", required: true, sameOrder: true },
          { key: "Dimensions", required: true, sameOrder: true },
          ...athletic,
        ],
        requiredCertificates: [],
      },
      {
        tOfPName: "Skipping Rope",
        exInfoData: [...athletic],
        requiredCertificates: [],
      },
    ],
  },
  {
    _id: "Bathroom",
    brands: ["NA", "iSTAR", "Plantex"],
    tOfProducts: [
      {
        tOfPName: "Holder For Bathroom",
        requiredCertificates: [],
        exInfoData: [
          { key: "Material", required: true, sameOrder: true },
          { key: "Container Type", required: false },
          { key: "Quantity", required: false, sameOrder: true },
        ],
      },
      {
        tOfPName: "Soap Stand",
        requiredCertificates: [],
        exInfoData: [
          { key: "Net Quantity", required: false, sameOrder: true },
          { key: "Container Type", required: false },
        ],
      },
      {
        tOfPName: "Tooth Brush Holder",
        requiredCertificates: [],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: true },
          { key: "Quantity", required: false },
        ],
      },
    ],
  },
  {
    _id: "Chess",
    brands: [],
    tOfProducts: [
      {
        tOfPName: "Chessboard",
        exInfoData: [...chess],
        requiredCertificates: [],
      },
      {
        tOfPName: "Chess Pieces",
        exInfoData: [...chess],
        requiredCertificates: [],
      },
      {
        tOfPName: "Chess Set",
        exInfoData: [...chess],
        requiredCertificates: [],
      },
      {
        tOfPName: "Chess Clock",
        exInfoData: [...chess],
        requiredCertificates: [],
      },
    ],
  },
  // "Men's Wear": {
  //   tOfPS: [
  //     "Mens Shirts",
  //     "Mens T-Shirts",
  //     "Mens Shorts ",
  //     "Mens Track Pants",
  //     "Mens Joggers",
  //     "Mens Jeans",
  //     "Mens Underwear",
  //     "Mens Vests",
  //   ],
  //   brands: ["Jockey"],
  //   keyValueD: {
  //     common: ["Material", "Care instructions"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin", "Net Quantity"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
  // "Men's Accessories": {
  //   tOfPS: [
  //     "Mens Belts",
  //     "Mens Cap",
  //     "Mens Coats",
  //     "Mens Jackets",
  //     "Mens Wallets",
  //   ],
  //   brands: ["Adidas", "Puma", "Protect", "Sixit", "Vicky"],
  //   keyValueD: {
  //     common: ["Material", "Net Quantity"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin", "Container Type"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
  // "Men's Footwear": {
  //   tOfPS: [
  //     "Mens Sports Shoes",
  //     "Mens Sneakers",
  //     "Mens Casual Shoes",
  //     "Mens Slippers",
  //     "Mens Socks",
  //   ],
  //   brands: ["Adidas", "Puma", "Protect", "Sixit", "Vicky"],
  //   keyValueD: {
  //     common: ["Material"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin", "Container Type"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },

  {
    _id: "Badminton",
    brands: ["NA", "Adidas", "Li-Ning", "Puma", "Yonex", "Vector X"],
    tOfProducts: [
      {
        tOfPName: "Badminton Ball",
        exInfoData: [...badminton],
        requiredCertificates: [],
      },
      {
        tOfPName: "Badminton Racket",
        exInfoData: [...badminton],
        requiredCertificates: [],
      },
      {
        tOfPName: "Badminton Ball",
        exInfoData: [...badminton],
        requiredCertificates: [],
      },
      {
        tOfPName: "Shuttlecock",
        exInfoData: [...badminton],
        requiredCertificates: [],
      },
    ],
  },

  {
    _id: "Body Care",
    brands: [
      "Ancient Living",
      "The Body Shop",
      "Neutrogena",
      "L'Oreal",
      "Lakme",
      "Himalaya Herbals",
      "Cetaphil",
      "Clinique",
      "Clean & Clear",
      "Nivea",
      "Garnier",
      "Olay",
      "Ponds",
      "Kiehl's",
      "Forest Essentials",
      "Lotus Herbals",
      "Aveeno",
    ],
    tOfProducts: [
      {
        tOfPName: "Body Wash",
        exInfoData: [...bodyCare],
        requiredCertificates: [],
      },
      {
        tOfPName: "Body Lotion",
        exInfoData: [...bodyCare],
        requiredCertificates: [],
      },
    ],
  },

  // "Car Accessories": {
  //   tOfPS: ["Car Dashboard"],
  //   brands: ["Godrej"],
  //   keyValueD: {
  //     common: ["Material"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
  // Cricket: {
  //   tOfPS: [
  //     "Cricket Bat",
  //     "Cricket Ball",
  //     "Cricket Stump",
  //     "Cricket Gloves",
  //     "Cricket Abdominal Guard",
  //     "Cricket Tennis Ball",
  //   ],
  //   brands: ["Adidas", "Puma", "Protect", "Sixit", "Vicky"],
  //   keyValueD: {
  //     common: ["Material", "Net Quantity"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin", "Container Type"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
  {
    _id: "Face Care",
    brands: [
      "Aveeno",
      "Bio-Oil",
      "DOT & KEY",
      "FoxTale",
      "The Body Shop",
      "Neutrogena",
      "L'Oreal",
      "Himalaya",
      "Cetaphil",
      "Clinique",
      "Clean & Clear",
      "Nivea",
      "Garnier",
      "Olay",
      "Ponds",
      "Kiehl's",
      "Forest Essentials",
      "Lotus Herbals",
      "Globus Naturals",
      "Simple",
    ],
    tOfProducts: [
      {
        tOfPName: "Face Wash",
        exInfoData: [...faceCare],
        requiredCertificates: [],
      },
      {
        tOfPName: "Face Cream",
        exInfoData: [...faceCare],
        requiredCertificates: [],
      },
      {
        tOfPName: "Face Scrub",
        exInfoData: [...faceCare],
        requiredCertificates: [],
      },
      {
        tOfPName: "Face Serum",
        exInfoData: [...faceCare],
        requiredCertificates: [],
      },
    ],
  },
  // "Home Appliances": {
  //   tOfPS: ["Air Freshener"],
  //   brands: ["Godrej"],
  //   keyValueD: {
  //     common: ["Material"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
  // Football: {
  //   tOfPS: [
  //     "Football Shoes",
  //     "Football",
  //     "Football Gloves",
  //     "Football Shoes",
  //   ],
  //   brands: ["Adidas", "Puma", "Nivia", "Sega", "Vector X"],
  //   keyValueD: {
  //     common: ["Material"],
  //     "Football Shoes": ["Sole material"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },

  {
    _id: "Hair Care",
    brands: ["Indulekha"],
    tOfProducts: [
      {
        tOfPName: "Shampoo",
        exInfoData: [...hairCare],
        requiredCertificates: [],
      },
    ],
  },

  // Skates: {
  //   tOfPS: [
  //     "Skateboard",
  //     "Inline Skates",
  //     "Roller Skates",
  //     "Skating Bag",
  //     "Quad Skates",
  //   ],
  //   brands: ["HCN", "VKDAS", "Viva"],
  //   keyValueD: {
  //     common: ["Size", "Item Weight", "Wheel Size"],
  //   },
  //   aInfo: {
  //     common: ["Material", "Wheel Material", "Country of Origin"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
  {
    _id: "Fitness",
    brands: ["NA", "Vector X", "SUVARNA", "Champs Fighter", "Morex", "Mikado"],
    tOfProducts: [
      {
        tOfPName: "Abs Exercise Equipment",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Weight Machine For Body",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Protein Shaker",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Exercise Ball",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Fitness Gloves",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Wrist Band",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Strengthener",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Yoga Mat",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Massage Roller",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Resistance Band",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
      {
        tOfPName: "Kettlebell",
        exInfoData: [...fitness],
        requiredCertificates: [],
      },
    ],
  },

  // Kitchen: {
  //   tOfPS: ["For Egg", "For Serving", "For Food Storage"],
  //   brands: [
  //     "NA",
  //     "Kent",
  //     "Whysko",
  //     "4 Sacred",
  //     "Lifelong",
  //     "Lishonn",
  //     "Nestasia",
  //     "Pepplo",
  //   ],
  //   keyValueD: {
  //     common: ["Material"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
  // "Men Athletic": {
  //   tOfPS: ["Men Supporter"],
  //   brands: ["BLACK PANTHER"],
  //   keyValueD: {
  //     common: ["Material"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
  {
    _id: "Showpiece",
    brands: ["NA", "Xtore", "Global Grabbers"],
    tOfProducts: [
      {
        tOfPName: "Good Luck",
        exInfoData: [...showpiece],
        requiredCertificates: [],
      },
      {
        tOfPName: "Vases",
        exInfoData: [...showpiece],
        requiredCertificates: [],
      },
      {
        tOfPName: "Wall Art",
        exInfoData: [...showpiece],
        requiredCertificates: [],
      },
      {
        tOfPName: "Mini Sculptures",
        exInfoData: [...showpiece],
        requiredCertificates: [],
      },
      {
        tOfPName: "Lanterns/Candle Holders",
        exInfoData: [...showpiece],
        requiredCertificates: [],
      },
      {
        tOfPName: "Tradition Showpiece",
        exInfoData: [...showpiece],
        requiredCertificates: [],
      },
    ],
  },

  {
    _id: "Sports",
    brands: ["NA", "Techno Galaxy", "Mikado", "Magic", "Vinex", "Nivia"],
    tOfProducts: [
      // {
      //   tOfPName: "Carrom Coins",
      //   exInfoData: [...sports],
      //   requiredCertificates: [],
      // },
      // {
      //   tOfPName: "Flying Disc",
      //   exInfoData: [...sports],
      //   requiredCertificates: [],
      // },
      // {
      //   tOfPName: "Basketball",
      //   exInfoData: [...sports],
      //   requiredCertificates: [],
      // },
      // {
      //   tOfPName: "Volleyball",
      //   exInfoData: [...sports],
      //   requiredCertificates: [],
      // },
      // {
      //   tOfPName: "Ball Pump",
      //   exInfoData: [...sports],
      //   requiredCertificates: [],
      // },
    ],
  },
];

export default categoriesInfo;
