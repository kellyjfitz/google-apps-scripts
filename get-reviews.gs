 /** @OnlyCurrentDoc */

function onOpen() {
 /* this adds a Refresh data menu option - so if someone wants to manually update the fuel prices they don't have to come to the script editor*/ 
 let ui = SpreadsheetApp.getUi();
  ui.createMenu('Refresh data')
    .addItem('Get new review', 'getStoryUrl')
    .addItem('Get info from url', 'providedUrl')
    .addToUi();
}

// Goes to section page, grabs the newest story details and sees if we have it or not
// If we don't have it, runs the function to get the info

function getStoryUrl() {
  //reviewers are not great about putting the right section on their stories, so the below sets out the section pages that we know only house reviews
  let restaurantReviews = "https://thewest.com.au/lifestyle/restaurant-reviews";
  let amandaReviews ="https://thewest.com.au/lifestyle/amanda-keenan";
  let breakfastBrunch = "https://thewest.com.au/lifestyle/perth-breakfast-brunch"

  getData (restaurantReviews);
  getData (amandaReviews);
  getData (breakfastBrunch);
  
  function getData(sectionPage) {
  /* Getting an array of the values in the URL column*/
  let existingUrls = SpreadsheetApp.getActive().getRange("reviews!D2:D").getValues();

  //it returns as a 2D array, so making it a normal array so I can compare the new URL to it
  existingUrls = [...new Set(existingUrls.flat())];
  
  /* grabbing the section page html so we can see what the latest published story is*/
  let sectionPageContent = UrlFetchApp.fetch(sectionPage).getContentText();

  /* regex to get the url of the top story on the section page */
  let urlRegExp = new RegExp(/(?<="css-3ropsm-StyledLink-StyledLink ew7cd2s4" href=")[^"]+/);
  let newUrl = urlRegExp.exec(sectionPageContent);

  /* making the proper url */
  newUrl = "https://thewest.com.au"+newUrl;

  //checking if the newUrl is already in our spreadsheet, the below returns true if there is a match and false if there isn't
  let match = existingUrls.includes(newUrl);

  //if there is no match, then it runs the function to get the story info
   if (match === false) {
    getStoryInfo(newUrl);
   }
  }

}

//This function gives a popup box for the user to put a URL in manually if it wasn't on the section page or got missed
function providedUrl () {
  let ui = SpreadsheetApp.getUi();
  let result = ui.prompt("Please paste your URL below");
  let newUrl = result.getResponseText();
  getStoryInfo(newUrl);
}

function getStoryInfo(newUrl) {
//this adds a new row to the spreadsheet
  let spreadsheet = SpreadsheetApp.getActive();
  let range = spreadsheet.getRange("reviews!A2").activate();
  let sheet = spreadsheet.getActiveSheet();
  sheet.insertRowsBefore(range.getRow(), 1);
  spreadsheet.getActiveRange().offset(0, 0, 1, spreadsheet.getActiveRange().getNumColumns()).activate();
  
  /* this sets some variables for the cells so we can put the data into the right columns.  */
  let urlCell = spreadsheet.getRange("reviews!D2");
  urlCell.setValue(newUrl);
  let image = spreadsheet.getRange("reviews!E2");
  let author = spreadsheet.getRange("reviews!G2");
  let date = spreadsheet.getRange("reviews!H2");
  
  //gets the html content of the new review page
  let newStory = UrlFetchApp.fetch(newUrl).getContentText();
 
    /* regex to get the url of the main image */
  let newStoryImageRegExp = new RegExp(/(?<="og:image" content=")[^"]+/);
  let newStoryImage = newStoryImageRegExp.exec(newStory);
  
  image.setValue(newStoryImage);

     /*figure out how to format the timestamp  */
  let newDateRegExp = new RegExp(/(?<="article:published_time" content=")[^T]+/);
  let newDate = newDateRegExp.exec(newStory)
  
  date.setValue(newDate);

   /*regex to get the author  */
  let newAuthorRegExp = new RegExp(/(?<="author name">)(\w|\s+)+/);
  let newAuthor = newAuthorRegExp.exec(newStory)
  
  author.setValue(newAuthor[0]);
}
