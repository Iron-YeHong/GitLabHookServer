var fs = require('fs');
// var request = require("request");

// var options = {
//   method: "GET",
//   url: "host/rest/api/content/13893633?expand=metadata.currentuser",
//   auth: { username: "yehong", password: "****" },
//   headers: {
//     Accept: "application/json"
//   }
// };

// request(options, function(error, response, body) {
//   if (error) throw new Error(error);

//   JSON.stringify(data)
//   console.log(
//     "Response: " + response.statusCode + " " + response.statusMessage
//   );
//   console.log(body);
// });

var data = JSON.parse(fs.readFileSync('body.json'));
console.log(data.body.editor.value)

// https://developer.atlassian.com/cloud/confluence/rest#api-content-id-put