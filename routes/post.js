'use strict';
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const responser = require('../util/responser');
const schema = require('../util/db-schema');
const Post = schema.Post;

router.route('/')
    .post((req, res) => {

    })
    .delete((req, res) => {

    })

router.get('/:grove/post/:id', (req, res) => {
    let access_token = req.body.access_token;
    Post.findOne({ _id:  })
        .exec((err, post) => {
            if(!err && post ){
                responser.success(res, post);
            } else {
                responser.error(res, 'Unable to find post.', 404);
            }
        });
});

module.exports = router;
