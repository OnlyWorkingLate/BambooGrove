'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groveSchema = new Schema({
    name: String,
    introduce: {
        short: String,
        long: String,
        fb_grove_url: String
    },
    admin: [{  type: Schema.Types.ObjectId  ref: 'Member'}],
    image: {
        profile: String,
        thumb: String,
        cover: String
    }
});

const postSchema = new Schema({
    title: String,
    category: String,
    article: String,
    upload_time: {  type: Date, default: Date.now  },
    last_change_time: {  type: Date, default: Date.now  },
    reporter: {
        ip: String,
        passcode: String
    }
});

const memberSchema = new Schema({
    name: String,
    email: String,
    fb: {
        access_token: String,
        refresh_token: String,
        user_id: String
    },
    access: {
        access_token: String,
        register_date: Date,
        last_login: Date,
    }
})

module.exports.Forest = mongoose.model('Grove', groveSchema);
module.exports.Post = mongoose.model('Post', postSchema);
module.exports.Member = mongoose.model('Member', memberSchema);
