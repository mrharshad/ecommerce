function dateFormatterNSN(data: Date) {
  // 16 September 2024
  const formatter = new Intl.DateTimeFormat("en-In", {
    //  ISO Date => 2024-09-16T12:28:20.232Z
    // new Date(2024-09-16T12:28:20.232Z)
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formatter.format(data);
}

function dateFormatterNNN(date: Date) {
  // 17-02-24
  let day: number | string = date.getDate();
  let month: number | string = date.getMonth() + 1; // क्योंकि getMonth() 0 से शुरू होता है, इसलिए +1 करना होगा
  let year: number | string = date.getFullYear();

  // दिन और महीने को 2 अंक का बनाने के लिए हम इसे '0' के साथ पैड कर सकते हैं
  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = "0" + month;
  }

  // अब इसे "साल-महीना-तारीख" के फॉर्मेट में फॉर्मेट कर लें
  return day + "-" + month + "-" + year;
}

export { dateFormatterNNN, dateFormatterNSN };
