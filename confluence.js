var fs = require("fs");
var request = require("request");

var querystring = require('querystring');
var cheerio = require("cheerio");

var setting = require("./setting").confluence;

var templateSetting = require("./template_setting");

var log4js = require("./logger");
var logger = log4js.getLogger("custom");
var logfile = log4js.getLogger("logfile")

function registerMergeRequest(merge){
  var desc = querystring.parse(merge.description,"<<<", ">>>")
  var mergeDesc = {
    num:3,
    developer: merge.developer,
    assignee: merge.assignee,
    changes: desc[templateSetting.changes.name],
    detail: desc[templateSetting.detail.name],
    influence: desc[templateSetting.influence.name]
  };

  logger.info(`Merge changes: ${mergeDesc.changes}`);
  logger.info(`Merge detail: ${mergeDesc.detail}`);
  logger.info(`Merge influence: ${mergeDesc.influence}`);

  logger.info("Start update content");
  updateContent(mergeDesc)
}

// https://developer.atlassian.com/cloud/confluence/rest#api-content-id-put
function updateContent(mergeDesc) {
  getVersion(function(version){
    getContent(function(content) {
      var json = JSON.parse(content);
      var editor = buildEditor(json.body.editor.value, mergeDesc);
  
      json.body.editor.value = editor;
      json.version = {
          number: version + 1
      }
  
      // 上传内容
      var options = {
        method: "PUT",
        url: `${setting.host}/rest/api/content/${setting.contentId}`,
        auth: {
          username: `${setting.username}`,
          password: `${setting.password}`
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(json)
      };
  
      logger.info("Updating contents...");
      //logfile.info(`Request Body:${options.body}`)
  
      request(options, function(error, response, body) {
        if (error) throw new Error(error);
  
        logger.info(
          "Response: " + response.statusCode + " " + response.statusMessage
        );
        logger.info("Content updated!");
        //logfile.info(`Response Body: ${body}`);
      });
    });
  })
}

function getContent(handler) {
    logger.info("Gettting contents...");
    get("expand=body.editor", function(body){
      logger.info(`Content got!`);
      handler(body)
    })
}

function getVersion(handler){
    logger.info("Gettting version...");
    get("version", function(body){
      var json = JSON.parse(body)
      var version = json.version.number;
      logger.info(`Get Version : ${version}`)
      handler(version)
    })
}

function get(param, handler){
    var options = {
        method: "GET",
        url: `${setting.host}/rest/api/content/${
          setting.contentId
        }?${param}`,
        auth: {
          username: `${setting.username}`,
          password: `${setting.password}`
        },
        headers: {
          Accept: "application/json"
        }
      };
    
      request(options, function(error, response, body) {
        if (error) throw new Error(error);
    
        logger.info(
          "Response: " + response.statusCode + " " + response.statusMessage
        );
    
        handler(body);
      });
}

function buildEditor(old, merge) {
  //var $ = cheerio.load(old);

  deleteTemplateHintContent(merge);
  var tr = createTableRow(merge);

  //$("table thead").append(tr);
  //return $("body").html().replace("<br>", "<br />");

  var index = old.indexOf("</thead>");
  var content = old.substr(0, index) + tr + old.substr(index);
    
  return content.replace(/<br>/g, '<br />');
}

function deleteTemplateHintContent(merge){
  merge.changes = merge.changes.replace(templateSetting.changes.desc, "");
  merge.detail = merge.detail.replace(templateSetting.detail.desc, "");
  merge.influence = merge.influence.replace(templateSetting.influence.desc, "");
}

function createTableRow(merge) {
  var $ = cheerio("<tr />");
  $.append(`<td class="confluenceTd">${merge.num}</td>`);
  $.append(`<td colspan="1" class="confluenceTd">${merge.changes}</td>`);
  $.append(`<td colspan="1" class="confluenceTd">${merge.developer}</td>`);
  $.append(`<td colspan="1" class="confluenceTd">${merge.assignee}</td>`);
  $.append(`<td colspan="1" class="confluenceTd">${merge.detail}</td>`);
  $.append(`<td colspan="1" class="confluenceTd">${merge.influence}</td>`);
  $.append(`<td colspan="1" class="confluenceTd"><br /></td>`);
  $.append(`<td colspan="1" class="confluenceTd"><br /></td>`);
  $.append(`<td colspan="1" class="confluenceTd"><br /></td>`);
  return `<tr>${$.html()}</tr>`;
}

module.exports.register = registerMergeRequest