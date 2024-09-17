const categoriesInfo = [
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
        requiredCertificates: [
          "Bureau of Indian Standards (BIS)",
          "Drug Controller General of India (DCGI)",
        ],
        exInfoData: [
          { key: "Material", required: true, sameOrder: true },
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
          { key: "Net Quantity", required: false, sameOrder: true },
        ],
      },
      {
        tOfPName: "Cap",
        requiredCertificates: [
          "Bureau of Indian Standards (BIS)",
          "Drug Controller General of India (DCGI)",
        ],
        exInfoData: [
          { key: "Net Quantity", required: false, sameOrder: true },
          { key: "Container Type", required: false },
        ],
      },
      {
        tOfPName: "Keychain",
        requiredCertificates: [
          "Bureau of Indian Standards (BIS)",
          "Drug Controller General of India (DCGI)",
        ],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
          { key: "Net Quantity", required: false, sameOrder: true },
        ],
      },
      {
        tOfPName: "Wallets",
        requiredCertificates: [
          "Bureau of Indian Standards (BIS)",
          "Drug Controller General of India (DCGI)",
        ],
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
        requiredCertificates: [],
        exInfoData: [
          { key: "Material", required: true, sameOrder: true },
          { key: "Container Type", required: false },
          { key: "Net Quantity", required: false, sameOrder: true },
        ],
      },
      {
        tOfPName: "Sport K-L Socks",
        requiredCertificates: [],
        exInfoData: [
          { key: "Net Quantity", required: false, sameOrder: true },
          { key: "Container Type", required: false },
        ],
      },
      {
        tOfPName: "Marking Cone",
        requiredCertificates: [],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
          { key: "Net Quantity", required: false, sameOrder: true },
        ],
      },
      {
        tOfPName: "Disc Cone",
        requiredCertificates: [
          "Bureau of Indian Standards (BIS)",
          "Drug Controller General of India (DCGI)",
        ],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
        ],
      },
      {
        tOfPName: "Ankle Support",
        requiredCertificates: [],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
        ],
      },
      {
        tOfPName: "Knee Support",
        requiredCertificates: [],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
        ],
      },
      {
        tOfPName: "Skipping Rope",
        requiredCertificates: [
          "Bureau of Indian Standards (BIS)",
          "Drug Controller General of India (DCGI)",
        ],
        exInfoData: [
          { key: "Country of Origin", required: false },
          { key: "Container Type", required: false },
        ],
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
          { key: "Net Quantity", required: false, sameOrder: true },
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
          { key: "Net Quantity", required: false },
        ],
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
  // "Face Care": {
  //   tOfPS: ["Face Wash", "Face Cream", "Face Scrub"],
  //   brands: [
  //     "The Body Shop",
  //     "Neutrogena",
  //     "L'Oreal",
  //     "Himalaya",
  //     "Cetaphil",
  //     "Clinique",
  //     "Clean & Clear",
  //     "Nivea",
  //     "Garnier",
  //     "Olay",
  //     "Ponds",
  //     "Kiehl's",
  //     "Forest Essentials",
  //     "Lotus Herbals",
  //     "Aveeno",
  //     "Globus Naturals",
  //     "Simple",
  //   ],
  //   keyValueD: {
  //     common: ["Skin Type", "Age range"],
  //     // "Face Cream": ["test 1", "test 2"],  isme kisi type ke product ka keyValue defrance kya hoga likh sakte hai
  //   },
  //   aInfo: {
  //     common: ["Country of Origin", "Container Type"],
  //   },
  //   certificate: {
  //     common: [
  //       // "Bureau of Indian Standards (BIS)",
  //       // "Drug Controller General of India (DCGI)",
  //     ],
  //   },
  // },
  // Badminton: {
  //   tOfPS: [
  //     "Badminton Ball",
  //     "Badminton Racket",
  //     "Badminton Accessories",
  //     "Shuttlecock",
  //   ],
  //   brands: ["NA", "Adidas", "Li-Ning", "Puma", "Yonex", "Vector X"],
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

  // "Body Care": {
  //   tOfPS: ["Body Wash", "Body Lotion"],
  //   brands: [
  //     "Ancient Living",
  //     "The Body Shop",
  //     "Neutrogena",
  //     "L'Oreal",
  //     "Lakme",
  //     "Himalaya Herbals",
  //     "Cetaphil",
  //     "Clinique",
  //     "Clean & Clear",
  //     "Nivea",
  //     "Garnier",
  //     "Olay",
  //     "Ponds",
  //     "Kiehl's",
  //     "Forest Essentials",
  //     "Lotus Herbals",
  //     "Aveeno",
  //   ],
  //   keyValueD: {
  //     common: ["Skin Type", "Net Quantity", "Age range"],
  //     // "Face Cream": ["test 1", "test 2"],  isme kisi type ke product ka keyValue defrance kya hoga likh sakte hai
  //   },
  //   aInfo: {
  //     common: ["Country of Origin", "Maximum Use", "Container Type"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },
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

  // "Hair Care": {
  //   tOfPS: ["Shampoo"],
  //   brands: ["Indulekha"],
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
  // Fitness: {
  //   tOfPS: [
  //     "Pushup Equipment",
  //     "Tools For Abs",
  //     "Weight Machine For Body",
  //     "Protein Shaker",
  //     "Exercise Ball",
  //     "Fitness Gloves",
  //     "Wrist Band",
  //     "Strengthener",
  //     "Yoga Mat",
  //     "Massage Roller",
  //     "Resistance Band",
  //     "Kettlebell",
  //   ],
  //   brands: [
  //     "NA",
  //     "Vector X",
  //     "SUVARNA",
  //     "Champs Fighter",
  //     "Morex",
  //     "Mikado",
  //   ],
  //   keyValueD: {
  //     common: ["Material"],
  //     "Weight Machine For Body": ["Warranty"],
  //     "Protein Shaker": ["Capacity", "Product Dimensions"],
  //   },
  //   aInfo: {
  //     common: ["Country of Origin"],
  //   },
  //   certificate: {
  //     common: [],
  //   },
  // },

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
  // Sports: {
  //   tOfPS: [
  //     "Chess Coins",
  //     "Chess Set",
  //     "Carrom Coins",
  //     "Flying Disc",
  //     "Basketball",
  //     "Volleyball",
  //     "Ball Pump",
  //   ],
  //   brands: ["NA", "Techno Galaxy", "Mikado", "Magic", "Vinex", "Nivia"],
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
  // Showpiece: {
  //   tOfPS: ["Energizing Art"],
  //   brands: ["NA", "Xtore", "Global Grabbers"],
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
];

export default categoriesInfo;
