const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    message: {
      type: String
    },
    sender: {
      type: String
    },
    timestamp:{
        type: Date,
        default: Date.now,
        timezone: 'Asia/Calcutta'
    }
  },
  {
    collection: 'chats'
})

let Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
