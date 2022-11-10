
  /** @OnlyCurrentDoc */

/* Goes to perthnow hey bestie section page, grabs the newest story details, puts them in a sheet*/
function getNewBestie() {
  /*getting the most recent url so I can compare it to the latest one on the section page */
  let firstCell = SpreadsheetApp.getActive().getRange("hey-bestie-list!A2");
  let currentUrl = firstCell.getValue();
  
  
  /* adding the heyBestie section page and grabbing the html*/
  let heyBestie = "https://www.perthnow.com.au/lifestyle/hey-bestie";
  let heyBestieContent = UrlFetchApp.fetch(heyBestie).getContentText();

    /* regex to get the url of the top story on the section page */
  let heyBestieRegExp = new RegExp(/(?<="css-1p01zat-StyledLink-StyledLink ew7cd2s4" href=")[^"]+/);
  let newBestieUrl = heyBestieRegExp.exec(heyBestieContent);

    /* making the proper url */
  newBestieUrl = "https://www.perthnow.com.au"+newBestieUrl;


  if (currentUrl != newBestieUrl) {
  
    /* going to the url for the new story */
  let newBestie = UrlFetchApp.fetch(newBestieUrl).getContentText()

    /* regex to get the url of the main image */
  let newBestieImageRegExp = new RegExp(/(?<="og:image" content=")[^"]+/);
  let newBestieImage = newBestieImageRegExp.exec(newBestie);
  

    /*regex to get the short headline  */
  let newBestieHeadRegExp = new RegExp(/(?<="og:title" content=")[^"]+/);
  let newBestieHead = newBestieHeadRegExp.exec(newBestie);
 
  
    /*figure out how to format the timestamp  */
  let newBestieDateRegExp = new RegExp(/(?<="article:published_time" content=")[^T]+/);
  let newBestieDate = newBestieDateRegExp.exec(newBestie);
 

  /* add a new row*/
  let spreadsheet = SpreadsheetApp.getActive();
  let range = spreadsheet.getRange('A2').activate();
  let sheet = spreadsheet.getActiveSheet();
  sheet.insertRowsBefore(range.getRow(), 1);
  spreadsheet.getActiveRange().offset(0, 0, 1, spreadsheet.getActiveRange().getNumColumns()).activate();

  
  /* add info to cells */
  let urlCell = spreadsheet.getRange("hey-bestie-list!A2");
  urlCell.setValue(newBestieUrl);

  let imageCell = spreadsheet.getRange("hey-bestie-list!B2");
  imageCell.setValue(newBestieImage);

  let headCell = spreadsheet.getRange("hey-bestie-list!C2");
  headCell.setValue(newBestieHead);

  let dateCell = spreadsheet.getRange("hey-bestie-list!D2");
  dateCell.setValue(newBestieDate);
  }
  
}

