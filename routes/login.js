'use strict';
const APP_ACCESS_TOKEN = '563998243780326|c_i4HwSwQvzLVwxf85d7uR_Vh4c';
const KAKAO_GET_USER_TOKEN = 'kauth.kakao.com/oauth/token';
const KAKAO_REST_API_KEY = '159dc87a911c2a93bb81a783fb1d3790';
const KAKAO_REDIRECT_URL = 'http://52.79.95.175/login';
const KAKAO_REQUEST_USER_INFO = 'https://kapi.kakao.com/v1/user/me';
const KAKAO_API_ADMIN_KEY = '8d2b8f24c0e10bb4b11f983a2c6f6e4b';
const INSPECT_KAKAO_ACCESS_TOKEN_URL = 'https://kapi.kakao.com/v1/user/access_token_info';

const express = require('express');
const router = express.Router();

router.route('/login/:type')
    .post((req, res) => {
        let login_type = req.params.type;
        let access_token = req.body.access_token,
            user_id = req.body.user_id;
        if(login_type === 'facebook') {

        } else if(login_type === 'kakao') {
            inspectKakaoAccessToken(access_token, function(data) {
                if(!data) {
                    return;
                } else {
                    //  Query user already exists.
                    Member.findOne({ 'social.kakao.id': data.id })
                    .exec((err, user) => {
                        if(err) {
                            errorKakaoLogin(res);
                        } else if(user) {
                            performLoginKakao(user);
                        } else {
                            //  create user_data
                            requestKakaoUserInfo(access_token, data.id, function(user_data) {
                                console.log(user_data);
                                createKakaoAccount(user_data, access_token);
                            });
                        }
                    });
                }
            });
        }
        function performLoginKakao(user) {
            user.access_token = tokenGenerator(user._id);
            user.save((err) => {
                if(!err) {
                    successKakaoLogin(res, user)
                } else {
                    errorKakaoLogin(res);
                }
            });
        }
        function successKakaoLogin(res, data) {
            res.json({
                status: 'OK',
                message: 'Succeeded to login by kakao.',
                user_id: data._id,
                access_token: data.access_token
            });
        }
        function errorKakaoLogin(res) {
            res.status(401).json({
                status: 'error',
                message: 'Failed to login kakao.'
            });
        }

        //  Inspect kakao Access token.
        //  if it is valid, perform login process.
        function inspectKakaoAccessToken(access_token, callback) {
            request({
                method: 'GET',
                url: INSPECT_KAKAO_ACCESS_TOKEN_URL,
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            })
            .on('error', (err) => {
                errorKakaoLogin(res);
                callback();
            })
            .on('response', (response) => {
                if(response.statusCode != 200) {
                    errorKakaoLogin(res);
                    callback();
                }
            })
            .on('data', (data) => {
                callback(JSON.parse(data));
            });
        }

        function createKakaoAccount(user_data, access_token) {
            let id = user_data.id;
            let name = user_data.properties.nickname;
            let profile_img = user_data.properties.profile_image;

            let kakao_user = new Member({
                name: name,
                profile_img: profile_img,
                social: {
                    kakao: {
                        id: id,
                        token: access_token
                    }
                }
            });
            kakao_user.save((err, user) => {
                if(!err && user) {
                    performLoginKakao(user);
                } else {
                    errorKakaoLogin(res);
                }
            });
        }
        function requestKakaoUserInfo(access_token, user_id, callback) {
            let user_info_request = {
                method: 'POST',
                url: KAKAO_REQUEST_USER_INFO,
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                form: {
                    target_id_type: 'user_id',
                    target_id: user_id
                }
            }
            request(user_info_request)
            .on('error', (err) => {
                errorKakaoLogin(res);
                callback();
            })
            .on('data', (data) => {
                callback(JSON.parse(data));
            })
            .on('response', (response) => {
                if(response.statusCode != 200) {
                    errorKakaoLogin(res);
                    callback();
                }
            });
        }
    })



    /**
        process OAuth authentication to facebook server.
    */
    function oauthFB(req, res) {
        var access_token = req.body.access_token;
        var DEBUG_TOKEN_API = 'https://graph.facebook.com/debug_token?'
        + 'input_token=' + access_token
        + '&access_token=' + APP_ACCESS_TOKEN;
        request.get(DEBUG_TOKEN_API)
            //  Report OAuth auth error
            .on('error', (err) => {
                reportError(req, err, 'OAuth authentication failure will report to error db.', res);
            })
            .on('response', (response) => {
                //  OAuth Failure
                //  send error response
                if(response.statusCode != 200) {
                    loginError(req, res, 'OAuth authentication failed. Check access token');
                }
            })
            //
            .on('data', (data) => {
                //  compare requested user_id to API resolved user_id.
                //  Then perform login.
                var resolved = JSON.parse(data);
                if(resolved.data.is_valid == true
                    && resolved.data.user_id == req.body.user_id) {
                    //  Perform login
                    loginFB(req, res);
                } else {
                    loginError(req, res, 'User id doesn\'t match. Use valid parameter.');
                }
            });
    }

    /**
        Perform login facebook account.
        if user is not exist, then create user and re-call this login process.
        @return login result
    */
    function loginFB(req, res) {
        Member.findOne({ 'social.facebook.id': req.body.user_id })
            .exec(function(err, member) {
                if(err) {
                    reportError(req, err, 'A database query user exception will report to error db.', res);
                }
                //  if user is not exist
                //  then create an user account
                //  from given user information
                if(!member) {
                    createFBAccount(req, res);
                } else {
                    member.access_token = tokenGenerator(member.social.facebook.id);
                    member.save((err) => {
                        if(err)
                            reportError(req, err, 'A database update user exception will report to error db.', res);
                        else {
                            loginSuccess(res, member._id.toString(), member.access_token);
                        }
                    })
                }
            });
    }

/**
    Create an account from the fb account info.
*/
function createFBAccount(req, res) {
    let access_token = req.body.access_token;
    let user_id = req.body.user_id;
    //  graph API user basic profile request URL.
    //  profile image url will solve LARGE SIZE picture.
    let GRAPH_PROFILE = 'https://graph.facebook.com/' + user_id
                        + '?access_token=' + access_token
                        + '&fields=picture.type(large),name,id'
    request.get(GRAPH_PROFILE, (err, response, body) => {
        // if(err)
        //     reportError(req, err,
        //         'An FB Graph API error occured while getting user data in creating user account process.', res);
        if(response.statusCode != 200) {
            responser.error(res, 'user_id or access_token is invalid. Check parameters.');
        }
        //  create member object
        //  save is complete, re-call loginFB() to perform login.
        let result = JSON.parse(body);
        let user = new Member({
            name: result.name,
            gender: result.gender,
            profile_img: result.picture.data.url,
            social: {
                facebook: {
                    id: result.id,
                    token: access_token
                }
            }
        });
        user.save((err) => {
            if(err) {
                responser.error(res, 'An error occured.', 500);
            } else {
                loginFB(req, res);
            }
        })
    });
}

/**
    process OAuth authentication to facebook server.
*/
function oauthFB(req, res) {
    var access_token = req.body.access_token;
    var DEBUG_TOKEN_API = 'https://graph.facebook.com/debug_token?'
    + 'input_token=' + access_token
    + '&access_token=' + APP_ACCESS_TOKEN;
    request.get(DEBUG_TOKEN_API)
        //  Report OAuth auth error
        .on('error', (err) => {
            reportError(req, err, 'OAuth authentication failure will report to error db.', res);
        })
        .on('response', (response) => {
            //  OAuth Failure
            //  send error response
            if(response.statusCode != 200) {
                loginError(req, res, 'OAuth authentication failed. Check access token');
            }
        })
        //
        .on('data', (data) => {
            //  compare requested user_id to API resolved user_id.
            //  Then perform login.
            var resolved = JSON.parse(data);
            if(resolved.data.is_valid == true
                && resolved.data.user_id == req.body.user_id) {
                //  Perform login
                loginFB(req, res);
            } else {
                loginError(req, res, 'User id doesn\'t match. Use valid parameter.');
            }
        });
}

/**
    Perform login facebook account.
    if user is not exist, then create user and re-call this login process.
    @return login result
*/
function loginFB(req, res) {
    Member.findOne({ 'social.facebook.id': req.body.user_id })
        .exec(function(err, member) {
            if(err) {
                reportError(req, err, 'A database query user exception will report to error db.', res);
            }
            //  if user is not exist
            //  then create an user account
            //  from given user information
            if(!member) {
                createFBAccount(req, res);
            } else {
                member.access_token = tokenGenerator(member.social.facebook.id);
                member.save((err) => {
                    if(err)
                        reportError(req, err, 'A database update user exception will report to error db.', res);
                    else {
                        loginSuccess(res, member._id.toString(), member.access_token);
                    }
                })
            }
        });
}
/**
    Create an account from the fb account info.

*/
function createFBAccount(req, res) {
    let access_token = req.body.access_token;
    let user_id = req.body.user_id;
    //  graph API user basic profile request URL.
    //  profile image url will solve LARGE SIZE picture.
    let GRAPH_PROFILE = 'https://graph.facebook.com/' + user_id
                        + '?access_token=' + access_token
                        + '&fields=picture.type(large),name,id,gender,birthday';
    request.get(GRAPH_PROFILE, (err, response, body) => {
        if(err)
            reportError(req, err,
                'An FB Graph API error occured while getting user data in creating user account process.', res);
        if(response.statusCode != 200) {
            loginError(req, res, 'user_id or access_token is invalid. Check parameters.');
        }
        //  create member object
        //  save is complete, re-call loginFB() to perform login.
        let result = JSON.parse(body);
        let user = new Member({
            name: result.name,
            gender: result.gender,
            profile_img: result.picture.data.url,
            social: {
                facebook: {
                    id: result.id,
                    token: access_token
                }
            }
        });
        user.save((err) => {
            if(err)
                reportError(res, err, 'An account error while saving created user data.');
            loginFB(req, res);
        })
    });
}


module.exports = router;
