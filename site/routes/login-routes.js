// login routes

const express = require("express");
const router = express.Router();
const userDao = require("../modules/users-dao.js");
const bcrypt = require("bcrypt");
const {google} = require('googleapis');

// process.env.http_proxy = 'http://18.163.190.137:448';
// process.env.HTTPS_PROXY = 'http://18.163.190.137:448';

// Whenever navigate to ANY page, make the "user" session object available to the
// Handlebars engine by adding it to res.locals.
router.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});

// / Whenever we navigate to /login, if we're already logged in, redirect to "/".
// // Otherwise, render the login view
router.get("/login", function (req, res) {
    res.locals.login= true;
    res.locals.title = "Login";
    res.locals.urlGoogle = url;

    if (req.session.user) {
            res.redirect("/");
    } else {
        res.locals.message = req.query.message;
        res.render("login");
    }
});



// Whenever POST to /register, login.
router.post("/login", async function (req, res) {
    res.locals.login = true;
    res.locals.title = "Site";
    // Get the email and password submitted in the form
    const email = req.body.email;
    const password = req.body.password;

    // check if email exists
    let emailAll = await userDao.retrieveAllEmail();
    let isExist = emailAll.some(function (value, index, array) {
        return (value.email === email);
    });

    if (isExist) {
        // Find a matching user in the database
        const user = await userDao.retrieveUserByEmail(email);

        // check if there is a matching user...
        const isMatch = bcrypt.compareSync(password, user.password);
        if (isMatch) {
            req.session.user = user;
            res.redirect("./?message=Successfully logged in!");
        } else {
            res.redirect("./login?message=Authentication failed!");
        }
    } else {
        res.redirect("./login?message=User does not exist!");
    }
});


const scope = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/userinfo.email',
];

const auth = new google.auth.OAuth2(
    '844916575638-54td6dbsjmf1afa2vbjf6oti3s3g8uom.apps.googleusercontent.com',
    'g6tX-Cdm0LS4hymsNV-IaFV7',
    'http://localhost:5000/oauth2callback'
);

// generate an url to google
const url = auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scope
});

function getGooglePlusApi(auth) {
    return google.plus({ version: 'v1', auth });
}

router.get("/oauth2callback",  async function (req, res) {

    // get code
    const code = req.query.code
    console.log(code);

    // get token
    const {tokens} = await auth.getToken(code)
    auth.setCredentials(tokens);
    console.log(tokens);
    // auth.on('tokens', (tokens) => {
    //     if (tokens.refresh_token) {
    //         console.log(tokens.refresh_token);
    //     }
    //     console.log(tokens.access_token);
    // });

    // get details
    const plus = getGooglePlusApi(auth);
    const me = await plus.people.get({ userId: 'me' });
    const userGoogleId = me.data.id;
    const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
    let user = {
        user_id: userGoogleId,
        name: userGoogleEmail,
        email: userGoogleEmail,
        password: null,
        review_count: 0,
        token: tokens
    }

    await userDao.createUser(user);
    req.session.user = user;
    res.redirect("./?message=Successfully logged in!");


});

module.exports = router;