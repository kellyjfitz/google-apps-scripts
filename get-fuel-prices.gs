/** @OnlyCurrentDoc */

// Info on the different FuelWatch RSS feeds is here: https://www.fuelwatch.wa.gov.au/tools/rss 

/**
 * A special function that runs when the spreadsheet is first
 * opened or reloaded. onOpen() is used to add custom menu
 * items to the spreadsheet.
 */
function onOpen() {
 /* this adds a Refresh data menu option - so if someone wants to manually update the fuel prices they don't have to come to the script editor*/ 
 var ui = SpreadsheetApp.getUi();
  ui.createMenu('Refresh data')
    .addItem('Refresh fuel prices', 'getFuel')
    .addToUi();
}

//separate function for getting the rss feed, because I use this more than once
function getFeed (url) {
let feed = UrlFetchApp.fetch(url).getContentText();
  feed = XmlService.parse(feed);
  feed = feed.getRootElement();
  let channel = feed.getChild("channel");
  return channel;
}

//this parses the feed, and works out the average for the price column
function getAverage (url) { 
  let channel = getFeed(url);
   let items = channel.getChildren("item");
  let prices = [];
  let sum = null;
  items.forEach ((i) => {
    i = i.getChild("price");
    i = i.getValue()
    i = parseFloat(i);
    prices.push(i)
    sum = sum + i;
    });
  let average = sum / prices.length;
  average = average.toFixed(2);
  return average;
}

//below gets the date from the rss feed so I can later compare it to the latest date in the spreadsheet
function checkDate (url) {
  let channel = getFeed(url);
  let date = channel.getChild("description").getValue();
  let dateRegExp = new RegExp(/[0-9\/]{8,10}/);
  date = dateRegExp.exec(date);
  Logger.log(date);
  return date;
}

function addRow () {
  let spreadsheet = SpreadsheetApp.getActive();
  let range = spreadsheet.getRange('A2').activate();
  let sheet = spreadsheet.getActiveSheet();
  sheet.insertRowsBefore(range.getRow(), 1);
  spreadsheet.getActiveRange().offset(0, 0, 1, spreadsheet.getActiveRange().getNumColumns()).activate();
}

function addCellInfo (cell, value) {
  let spreadsheet = SpreadsheetApp.getActive();
  let urlCell = spreadsheet.getRange(cell);
  urlCell.setValue(value);
  }

//The RSS feeds differ based on the region, fuel type and day you are searching on 

function getFuel () {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // after 2.30pm tomorrow's data becomes available from a different URL
  // the below changes the URL depending on the time
  let day = "today";
  if (hour >= 14 && minutes > 30) {
   day = "tomorrow"};
   Logger.log(day);

  //setting the static parts of the URL separately
  let rssFeed = "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?";
  let metro = "&StateRegion=98";
  let urlDay = "&Day="

  //fueltypes have different codes that go into the URL
  let fuelTypes = {ulp: "Product=1", pulp: "Product=2", genericDiesel: "Product=4", brandDiesel: "Product=11", ron98: "Product=6", lpg: "Product=5", e85: "Product=10"};

  //putting the ulpUrl into a variable because I want to grab the date from it to compare to date in the first row of the sheet
  let ulpUrl = `${rssFeed}${fuelTypes.ulp}${metro}${urlDay}${day}`;
  let date = checkDate(ulpUrl);

  let spreadsheet = SpreadsheetApp.getActive();
  let currentDate = spreadsheet.getRange("fuel-prices!A2");
  currentDate = currentDate.getValue();
  currentDate = new Intl.DateTimeFormat('en-GB').format(currentDate);
  Logger.log(currentDate);
  
  if (date != currentDate) {
    addRow();
    addCellInfo("fuel-prices!A2", date);

    let ulpAverage = getAverage(ulpUrl);
    Logger.log("ULP: "+ulpAverage);

    let pulpAverage = getAverage(`${rssFeed}${fuelTypes.pulp}${metro}${urlDay}${day}`);
    Logger.log("PULP: "+pulpAverage);

    //when the FuelWatch site graphs diesel they often combine diesel and brand diesel for the price average, so we are doing this here too
    let genericDieselAverage = getAverage(`${rssFeed}${fuelTypes.genericDiesel}${metro}${urlDay}${day}`);
    let brandDieselAverage = getAverage(`${rssFeed}${fuelTypes.brandDiesel}${metro}${urlDay}${day}`);

    //rounding to two decimal points makes it a string, so have to parseFloat again to do calculations
    let dieselAverage = parseFloat(genericDieselAverage)+parseFloat(brandDieselAverage);
    dieselAverage = dieselAverage/2;
    dieselAverage = dieselAverage.toFixed(2);
    Logger.log("Diesel: "+dieselAverage); 

    let ron98Average = getAverage(`${rssFeed}${fuelTypes.ron98}${metro}${urlDay}${day}`);
    Logger.log("98Ron: "+ron98Average);

    let lpgAverage = getAverage(`${rssFeed}${fuelTypes.lpg}${metro}${urlDay}${day}`);
    Logger.log("LPG: "+lpgAverage);

    let e85Average = getAverage(`${rssFeed}${fuelTypes.e85}${metro}${urlDay}${day}`);
    Logger.log("E85: "+e85Average);

    //putting all of the data into the spreadsheet
    addCellInfo("fuel-prices!B2", ulpAverage);
    addCellInfo("fuel-prices!C2", lpgAverage);
    addCellInfo("fuel-prices!D2", dieselAverage);
    addCellInfo("fuel-prices!E2", ron98Average);
    addCellInfo("fuel-prices!F2", pulpAverage);
  }
};
