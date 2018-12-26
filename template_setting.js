/*jshint esversion: 6 */

var path = require("path");
var fs = require("fs");

var logger = require("./logger");

let setting = null;
let configFile = path.resolve("merge_request_template.json");

if(fs.existsSync(configFile)){
    try{
        var data = fs.readFileSync(configFile);
        setting = JSON.parse(data);
    }
    catch(err){
        logger.error(err);
        logger.info("Process exiting...")

        process.exit();
    }
}else{
    logger.error(`File not exists：${configFile}`);
    logger.info("Process exiting...")
        
    process.exit();
}

module.exports = setting