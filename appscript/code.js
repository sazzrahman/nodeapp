function sendToS3(data_obj, obj_name) {
    S3.init("access_key", "secret_acceess_key")
    response = S3.putObject(bucketName = "bucket", objectName = obj_name, object = data_obj, region = "us-west-2")
    console.log(response)
}

function onOpen() {
    createEmptyMenu();
}

function createEmptyMenu() {
    var menu = SpreadsheetApp.getUi().createMenu("Sync Data");
    menu.addItem("Sync Redshift", "doGet");
    menu.addToUi();
}



function doGet(e) {
    var sheet = SpreadsheetApp.getActive();
    var currentSheet = sheet.getActiveSheet();
    var numRows = currentSheet.getLastRow();
    var numCols = currentSheet.getLastColumn();
    var rows = currentSheet.getRange(1, 1, numRows, numCols).getValues();
    var header = rows[0].map(str => str.replace(/[\s\W]+/g, "_").toLowerCase())
    var data = []

    for (var i = 1; i < numRows; i++) {
        currentRow = {}

        for (var j = 0; j < numCols; j++) {
            var currentValue = rows[i][j]
            currentRow[header[j]] = currentValue
        }

        // send data in batches of 500
        if (i % 500 == 0 | i == numRows - 1) {
            data.push(currentRow)
            jLines = data.map(JSON.stringify).join("\n")
            // console.log(jLines)
            sendToS3(jLines, `folderName/${currentSheet.getName()}/file${i}.json`)
            data = []

        } else {
            data.push(currentRow)
        }

    }

}







