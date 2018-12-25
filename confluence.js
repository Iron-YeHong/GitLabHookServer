var fs = require("fs");
var request = require("request");

var querystring = require('querystring');
var cheerio = require("cheerio");

var setting = require("./setting").confluence;

function registerMergeRequest(merge){
  var desc = querystring.parse(merge.description,"<<<", ">>>")
  var mergeDesc = {
    num:3,
    developer: merge.developer,
    assignee: merge.assignee,
    changes: desc["[概述]"],
    detail: desc["[详细说明]"],
    influence: desc["[影响功能]"]
  };

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
  
      console.log("Updating contents...");
      console.log(`Body:${options.body}`)
  
      request(options, function(error, response, body) {
        if (error) throw new Error(error);
  
        console.log(
          "Response: " + response.statusCode + " " + response.statusMessage
        );
        console.log(`Body: ${body}`);
      });
    });
  })
}

function getContent(handler) {
    console.log("Gettting contents...");
    get("expand=body.editor", function(body){
      console.log(`Content got!`);
      handler(body)
    })
}

function getVersion(handler){
    console.log("Gettting version...");
    get("version", function(body){
      var json = JSON.parse(body)
      var version = json.version.number;

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
    
        console.log(
          "Response: " + response.statusCode + " " + response.statusMessage
        );
    
        handler(body);
      });
}

function buildEditor(old, merge) {
//   var $ = cheerio.load(old);
  var tr = createTableRow(merge);

//   $("table thead").append(tr);
//   return $("body").html().replace("<br>", "<br />");

    var index = old.indexOf("</thead>");
    var content = old.substr(0, index) + tr + old.substr(index);
    
   return content.replace(/<br>/g, '<br />');
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