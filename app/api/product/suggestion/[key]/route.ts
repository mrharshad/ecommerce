import { ISearchesIdentity, ISuggestions } from "@/app/redux/UserSliceTypes";

// apply api  - header.js
interface IContext {
  params: { key: string };
}
export async function GET(req: Request, context: IContext) {
  try {
    const searchKey = context.params.key;
    let tOfPData = [
      "Ball",
      "Hand Grip",
      "Abs Roller",
      "Football Shoes",
      "Volleyball",
      "Football Socks",
      "Badminton Racket",
      "Fitness Gloves",
      "Resistance Band",
      "Disc Cones",
      "Marking Cones",
      "Massage Roller",
      "Kettle Bell",
      "Resistance Tube",
      "Wrist Support",
      "Inline Skates",
      "Shuttlecock",
      "Dumbbell",
      "Cricket Stumps",
      "Gym Ball",
      "Quad Roller Skates",
      "Ab Roller",
      "Skipping Rope",
      "Protein Shaker",
      "Chess Set",
      "Chess Coin",
      "Yoga Mat",
      "Water Bottle",
      "Carrom Coins",
      "Knee Support",
      "Chess Pieces",
      "Supporter",
      "Elbow Support",
      "Skating Protective Set",
      "Throwing Discs",
      "Hand Gripper",
      "Weighing Scale",
      "Abdominal Guard",
      "Face Scrub",
      "Face Cream",
      "Face Moisturizer",
      "Bleach",
      "Face Wash",
      "Sunscreen",
      "Face Lotion",
    ];

    let nameData = [
      { identity: 1, key: "Sixit Lite Cricket Tennis Ball" },
      {
        identity: 3,
        key: "Morex 10 KG-40 KG  Adjustable Hand Grip Strengthener",
      },
      { identity: 4, key: "Vector X Abs  Roller" },
      { identity: 5, key: "Sega Spectra Football Shoes" },
      {
        identity: 6,
        key: "Spartan Approved By Vfi Super Volley Leather Volleyball",
      },
      { identity: 7, key: "Vicky Cricket Tennis Ball" },
      { identity: 8, key: "Vector X Cyrus Football Socks" },
      { identity: 9, key: "Sega Men'S  Football Shoes" },
      { identity: 10, key: "Nivia Shining Star Football" },
      { identity: 11, key: "Yonex Badminton Racket 200 THL" },
      { identity: 12, key: "Vector X Vx-Majestic Fitness Gloves" },
      { identity: 14, key: "Vector X Restance Band" },
      {
        identity: 15,
        key: "Disc Plastic Space Marker Agility Soccer Cones for Training, Field Cone Mar",
      },
      { identity: 16, key: "Multi Color Plastic Marking Cones 10 pieces" },
      {
        identity: 17,
        key: "Vector X JF-3159 Massage Roller for Physical Therapy Muscle Recovery",
      },
      {
        identity: 18,
        key: "Vector X JF-3169 Massage Roller for Physical Therapy Muscle Recovery",
      },
      { identity: 19, key: "Kettle Bell 1kg - 10kg" },
      { identity: 20, key: "VECTOR X JF-2103 Resistance Tube" },
      {
        identity: 21,
        key: "Champs fighter  Cotton Wrist Support - Pack of 2",
      },
      {
        identity: 22,
        key: "Mikado wrist support comfortable Cotton Gym Wrist band Wrap Band",
      },
      { identity: 23, key: "Viva Inline Unisex Outdoor Adjustable Skating" },
      { identity: 24, key: "Yonex Mavis 350 Nylon Shuttlecock" },
      { identity: 25, key: "Yonex Mavis 2000 Nylon Shuttlecock" },
      { identity: 26, key: "Yonex Mavis 600 Nylon Shuttlecock" },
      { identity: 27, key: "Yonex Mavis 10 Nylon Shuttlecock" },
      { identity: 28, key: "Li-Ning Bolt Boost shuttlecock" },
      { identity: 29, key: "Vinyl Dumbbells Set" },
      { identity: 30, key: "Plastic Cricket Stumps Set" },
      { identity: 31, key: "Li-Ning Bolt Neo shuttlecock" },
      {
        identity: 32,
        key: "Cricket Wooden Stumps , Wickets Stumps , Cricket Stumps",
      },
      {
        identity: 33,
        key: "Vector X Gym Ball, Exercise Ball, Yoga Ball, Workout  Ball  with Foot Pump",
      },
      { identity: 34, key: "VIVA  Quad Roller Skates" },
      {
        identity: 35,
        key: "Vector X Broad Exercise Wheel for core workout, ab roller",
      },
      { identity: 38, key: "Protech Adjustable Jumping Rope, Skipping Rope" },
      { identity: 39, key: "Adjustable Jumping Rope, Skipping Rope" },
      { identity: 40, key: "Vector X Shaker Bottle For Protein Shaker" },
      {
        identity: 41,
        key: "Vector X Plastic Gym Energy Shaker Bottle 600 Milliliters",
      },
      {
        identity: 42,
        key: "Mikado sports 18'' x 18'' Tournament Chess Vinyl Foldable Chess",
      },
      { identity: 43, key: "Vinex Roll On Chess Set , Vinyl Foldable Chess" },
      { identity: 44, key: "Vinex Regular Chess Coin" },
      { identity: 45, key: "Vector X  PVC Printed Yoga Mat" },
      { identity: 46, key: "Vector X Yoga mat, Exercise Yoga Mat" },
      {
        identity: 48,
        key: "Cello Swift Stainless Steel Vacuum Insulated Flask 1000ml | Hot and Cold",
      },
      {
        identity: 49,
        key: "Mikado Wrist Support,  Mikado wrist Wrap Ultima",
      },
      { identity: 50, key: "Impact Wood carrom coins" },
      { identity: 51, key: "Magic Wood carrom coins" },
      {
        identity: 52,
        key: "Champs Fighter sports knee cap , Knee Pain Knee Support , Gym knee cap",
      },
      {
        identity: 53,
        key: "Champs Fighter sports knee wrap , Knee Pain Knee Support , Gym knee wrap",
      },
      {
        identity: 54,
        key: "Iron Adjustable dumbbell , Iron dumbbell 2kg to 10kg",
      },
      {
        identity: 55,
        key: "Mikado Roller Skates, four wheeler skates, Mikado Skates",
      },
      { identity: 56, key: "Vector X Fittness Gloves Vx 300, Gym Gloves" },
      {
        identity: 57,
        key: "Techno Galaxy Heavy Men-Solid Chess Pieces, Chess Coin",
      },
      {
        identity: 58,
        key: "Champs Fighter Nexa knee Support , Knee Pain Knee Support , Gym knee cap",
      },
      {
        identity: 59,
        key: "Champs Fighter Nexa Gym Cotton Supporter, Sports Underwear",
      },
      { identity: 60, key: "Mikado apex crysta badminton racket" },
      { identity: 61, key: "Champs Fighter Nylon Elbow Support" },
      {
        identity: 62,
        key: "Black Panther Maxx Supporter Soft Stretch Spandex Belt, Sports Underwear",
      },
      { identity: 63, key: "Mikado skating protective set" },
      {
        identity: 64,
        key: "Outdoor Catching & Throwing Discs,Dog Training Disc, Flying Discs Game",
      },
      { identity: 65, key: "PVC Hand Gripper,  Hand Strength" },
      {
        identity: 66,
        key: "Ksports ankle socks multiple colour patterns socks, sport socks",
      },
      {
        identity: 67,
        key: "Suvarna Electro Lite Weighing Scale , Weight Machine For Body Weight",
      },
      {
        identity: 68,
        key: "Suvarna  Ele150 Weighing Scale, Weight Machine For Body Weight",
      },
      {
        identity: 69,
        key: "Vector X VXB-902 Aluminum Composite One Piece Joint Less Badminton Racket",
      },
      {
        identity: 70,
        key: "Protect Abdominal Guard for Cricket and Other Sports, L Guard",
      },
      { identity: 71, key: "Black panther Twin pack socks, Sports Socks" },
      {
        identity: 72,
        key: "Mamaearth Vitamin C Face Scrub for Glowing Skin, With Vitamin C",
      },
      {
        identity: 73,
        key: "Biotique Morning Nectar Flawless Skin Moisturizer l Prevents Dark spots",
      },
      {
        identity: 74,
        key: "VLCC Insta Glow Diamond Bleach | With Diamond Powder For Sparkling Fairness",
      },
      {
        identity: 75,
        key: "Cetaphil Brightness Reveal Creamy Face Wash for Uneven Skin Tone",
      },
      {
        identity: 76,
        key: "The Derma Co 1% Hyaluronic Sunscreen SPF 50 Aqua Gel for Oily and Dry Skin",
      },
      {
        identity: 77,
        key: "Jovees Herbal Sun Guard Lotion SPF 60 PA+++Broad Spectrum  3 in 1 Matte",
      },
      {
        identity: 78,
        key: "Ustraa Face & Stubble Lotion For Beard Softening, Dermatologically Tested",
      },
      {
        identity: 79,
        key: "Pond's Men Energy Bright Anti-Dullness Facewash With Coffee Bean",
      },
      {
        identity: 80,
        key: "Garnier Bright Complete Vitamin C Gel Face Wash , Instant Brighter Skin",
      },
    ];

    const regex = new RegExp(searchKey, "i");
    const data = tOfPData
      .flatMap<ISuggestions>((key) => {
        if (regex.test(key) || searchKey.includes(key)) {
          return { key, identity: "tOfP" };
        } else return [];
      })
      .slice(0, 200);
    if (data.length < 10) {
      const names = nameData.filter((obj) => regex.test(obj.key));
      data.push(...names);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        searchKey,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: 200,
        }
      );
    }
  }
}
