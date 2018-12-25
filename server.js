/*jshint esversion: 6 */
var setting = require("./setting")

var logger = require("./logger");
var confluence = require("./confluence");

let host = setting.webhook.host;
let port = setting.webhook.port;
let url = setting.webhook.url;


var http = require("http");
var handler = require("./gitlab_webhook_handler")({ path: `${url}` });

// creat a GitLab webhook server
http
  .createServer(function(req, res) {
    handler(req, res, function() {
      res.statusCode = 404;
      res.end(`no such location: ${req.url}`);
    });
  })
  .listen(port);

logger.info(`GitLab Hook Server running at ${host}:${port}${url}`);

// handle gitlab events
handler.on("error", function(err) {
  console.error("Error:", err.message);
});

handler.on("push", function(event) {
  console.log(
    "Received a push event for %s to %s",
    event.payload.repository.name,
    event.payload.ref
  );
});

handler.on("issues", function(event) {
  console.log(
    "Received an issue event for %s action=%s: #%d %s",
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title
  );
});

handler.on("merge_request", function(event) {

  let source_branch = event.payload.object_attributes.source_branch;
  let target_branch = event.payload.object_attributes.target_branch;

  if (event.payload.object_attributes.action == "open") {
    console.log(
      "Received an merge_request event @%s from %s(%s) to %s(%s)",
      event.payload.repository.name,
      source_branch,
      event.payload.user.name,
      target_branch,
      event.payload.assignee.name
    );
  } else if (event.payload.object_attributes.action == "merge") {
    console.log(
      "Received an merge event @%s from %s(%s) to %s(%s)",
      event.payload.repository.name,
      source_branch,
      event.payload.user.name,
      target_branch,
      event.payload.assignee.name
    );

    if(setting.repository.targets != null){
        if(setting.repository.targets.indexOf(target_branch) == -1){
          logger.info("The target branch is not in the config.json file.");
          return;
        }
    }

    confluence.register({
      developer: event.payload.user.name,
      assignee: event.payload.assignee.name,
      description: event.payload.object_attributes.description
    });
  }
});