const express = require("express");
const mysql = require("mysql");
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');

var hbs = require('hbs');


dotenv.config({ path: './.env' });

// let configuration = {
//    host: "localhost",
//    user: "root",
//     password: "boobdrag3",
//     database: "ps", //default db name
//     port: 3306
// };

let configuration = {
    host: "practice-smith-db-do-user-12690371-0.b.db.ondigitalocean.com",
    user: "doadmin",
    password: "AVNS_5Ufid5XorBVrhv_bUL8",
    port: "25060",
    database: "ps"
}


const app = express();
app.use(session({
    secret: '123458cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))


app.set('view engine', 'hbs');
hbs.registerHelper('eq', (a, b) => a == b);


app.use(flash());


const db = mysql.createConnection(configuration);

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.set('views', path.join(__dirname, './views'));


//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
//Parse JSON bodies (as send by API clients)
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
//  extended: false
//}));




db.connect(function (err) {
    if (err) throw err;
    console.log("Connected to db!");
});

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/team', require('./routes/team'));
app.get('*', function (req, res) {
    res.status(400).send('<img src="https://i.imgur.com/N5ZsAsJ.png" alt="404">')
})

app.listen(2001, () => {
    console.log("Server started on port 2001");
});