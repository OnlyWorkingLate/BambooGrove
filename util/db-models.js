'use strict';
const sequelize = require('sequelize');

const User = sequelize.define('user', {
    user_id: {
        type: Sequelize.STRING(30),
        unique: true,
        primaryKey: true,
        autoIncrement: true
    }
    name: { type: Sequelize.STRING(20) },
    access_token: { Sequelize.STRING },
    signuo_time: { type: Sequelize.DATE },
    last_signin_time: { type: Sequelize.DATE },
    login_type: { type: Sequelize.STRING(15) },
    registration_id: { type: Sequelize.STRING }
});

const Post - sequelize.define('post', {
    post_id: {
        type: Sequelize.INTEGER(11).UNSIGNED,
        primaryKey: true,
        autoIncrement: true },
    article: { type: Sequelize.TEXT },
    upload_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING(30),
        references: { model: User, key: 'user_id' }
    }
});
