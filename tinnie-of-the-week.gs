/** @OnlyCurrentDoc */

/* Goes to perthnow tinnie of the week section page, grabs the newest story details, puts them in a sheet*/

function getNewTinnie() {

  /* Getting the latest URL in the sheet from the first cell, so I can compare it to the newest one a bit later*/
  let firstCell = SpreadsheetApp.getActive().getRange("tinnie!A2");
  let currentUrl = firstCell.getValue();
  
  /* adding the tinnie section page and grabbing the html*/
  let tinnie = "https://www.perthnow.com.au/lifestyle/tinnie-of-the-week";
  let tinnieContent = UrlFetchApp.fetch(tinnie).getContentText();

  /* regex to get the url of the top story on the section page */
  let tinnieRegExp = new RegExp(/(?<="css-1p01zat-StyledLink-StyledLink ew7cd2s4" href=")[^"]+/);
  let newTinnieUrl = tinnieRegExp.exec(tinnieContent);

  /* making the proper url */
  newTinnieUrl = "https://www.perthnow.com.au"+newTinnieUrl;

  /* Check if the latest URL is different to the top one in our spreadsheet and taking action if it is different */
  if (currentUrl != newTinnieUrl) {

    /* add a new row*/
    let spreadsheet = SpreadsheetApp.getActive();
    let range = spreadsheet.getRange('A2').activate();
    let sheet = spreadsheet.getActiveSheet();
    sheet.insertRowsBefore(range.getRow(), 1);
    spreadsheet.getActiveRange().offset(0, 0, 1, spreadsheet.getActiveRange().getNumColumns()).activate();
  
    /* put URL into first column of new row */
    let urlCell = spreadsheet.getRange("tinnie!A2");
    urlCell.setValue(newTinnieUrl);

    /* fetching the html from the new tinnie page*/
    let newTinnie = UrlFetchApp.fetch(newTinnieUrl).getContentText();
      
    /*get the beer NAME - doing this by using a cell formula which references the URL in the first cell, then finds the first par under the first h2 */ 
    let nameCell = spreadsheet.getRange("tinnie!B2");
    nameCell.setFormula('=IMPORTXML(A2,"//*[@id=\'ArticleContent\']/h2[1]/following-sibling::p[1]")');

    /*copying the value of the cell and adding it back, so there is text there and not a formula */
    let name = nameCell.getValue();
    nameCell.setValue(name);

    /*get the beer RATING - doing this by using a cell formula which references the URL in the first cell, then finds the first par under the LAST h2 */ 
    let ratingCell = spreadsheet.getRange("tinnie!C2");
    ratingCell.setFormula('=importxml (A2,"//*[@id=\'ArticleContent\']/h2[last()]/following-sibling::p[1]")');
    
    /*getting the value of the cell so I have a number and not a formula*/
    let rating = ratingCell.getValue();

    /*getting rid of extra text with the rating */
    let ratingRegExp = new RegExp(/[0-9.]{1,3}/)
    rating = ratingRegExp.exec(rating);

    /*putting the rating in the cell */
    ratingCell.setValue(rating);

    /* regex to get the url of the main IMAGE */
    let newTinnieImageRegExp = new RegExp(/(?<="og:image" content=")[^"]+/);
    let newTinnieImage = newTinnieImageRegExp.exec(newTinnie);

    /* put the image url into the right cell*/
    let imageCell = spreadsheet.getRange("tinnie!D2");
    imageCell.setValue(newTinnieImage);

        /*regex to get the AUTHOR  */
    let newTinnieAuthorRegExp = new RegExp(/(?<="author name">)(\w|\s+)+/);
    let newTinnieAuthor = newTinnieAuthorRegExp.exec(newTinnie)

    /*put the author into the right cell */
    let authorCell = spreadsheet.getRange("tinnie!E2");
    authorCell.setValue(newTinnieAuthor[0]);

    /*regex to get the publish DATE */
    let newTinnieDateRegExp = new RegExp(/(?<="article:published_time" content=")[^T]+/);
    let newTinnieDate = newTinnieDateRegExp.exec(newTinnie)
    
    /*put the date into the right cell */
    let dateCell = spreadsheet.getRange("tinnie!F2");
    dateCell.setValue(newTinnieDate);

  }
    

}


