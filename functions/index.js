const functions = require("firebase-functions");
const admin = require("firebase-admin");
var IncomingWebhook = require("@slack/client").IncomingWebhook;

admin.initializeApp(functions.config().firebase);

var url = "https://hooks.slack.com/services/<blah>";
var webhook = new IncomingWebhook(url);

exports.createTrip = functions.firestore
  .document("litterTrips/{tripId}")
  .onCreate((event) => {
    var newValue = event.data();
    var message = newValue.CatName + " is going potty!";
    // sendMessage(message); can't call external webhooks from the Free plan
    pushMessage(message);
    return true;
  });

// Function to send notification to a slack channel.
function sendMessage(message) {
  webhook.send(message, (err, header, statusCode, body) => {
    if (err) {
      console.log("Error:", err);
    } else {
      console.log("Received", statusCode, "from Slack");
    }
  });
}

// Function to push notification to a topic.
function pushMessage(message) {
  var payload = {
    notification: {
      title: message,
    },
  };

  admin
    .messaging()
    .sendToTopic("littertrips", payload)
    .then((response) => {
      console.log("Successfully sent message:", response);
      return null;
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}
