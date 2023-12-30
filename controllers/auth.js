const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
var fixedToken = 0;

// const db = mysql.createConnection({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     databse: process.env.DATABASE
// });


let configuration = {
    //    host: "localhost",
    //    user: "root",
    //    password: "boobdrag3",
    //    database: "ps" // Add database name here
    // };

    host: "practice-smith-db-do-user-12690371-0.b.db.ondigitalocean.com",
    user: "doadmin",
    password: "AVNS_5Ufid5XorBVrhv_bUL8",
    port: "25060",
    database: "ps"
}

const db = mysql.createConnection(configuration);


exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).redirect('/login', {
                message: 'Enter both eamil and password'
            })
        }

        db.query('SELECT * FROM users WHERE Email = ?', [email], async (error, results) => {
            console.log("Login results: ");
            console.log(results);

            if ((results.length > 0)) {
                //console.log("These are results: " + results);
                if (await bcrypt.compare(password, results[0].Password)) {
                    const JWT_id = results[0].User_ID;

                    const token = jwt.sign({ id: JWT_id }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });

                    fixedToken = token;

                    console.log("The token is: " + token);

                    const cookieOptions = {
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                        ),
                        httpOnly: true
                    }
                    console.log("Logged in, redirecting...");
                    res.cookie('jwt', token, cookieOptions);
                    res.redirect('/HomePage');
                }
                else {
                    res.status(401).render('login', {
                        message: 'Email or Password is incorrect'
                    })
                }
            }
            else {
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                })
            }
        })
    } catch (error) {
        console.log(error);
    }
}


let new_user_id = 0;

exports.register = (req, res) => {

    //const { name, email, password, passwordConfirm } = req.body;
    const name = req.body.name;
    const email = req.body.emailUser;
    const password = req.body.passwordUser;
    const passwordConfirm = req.body.passwordConfirmUser;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('login', {
                message: 'That email is already in use'
            })
        }
        else if (password !== passwordConfirm) {
            return res.render('login', {
                message: 'Passwords do not match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        // get the max user id and assign the new user max(userid) + 1
        db.query('SELECT MAX(User_ID) as uid from users', (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                new_user_id = results[0].uid + 1;
                db.query('INSERT INTO users SET ?', { Name: name, Email: email, Password: hashedPassword, User_ID: new_user_id }, (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        res.render("login", {email, password});
                    }
                })
            }
        })
    });
}


exports.isLoggedIn = async (req, res, next) => {
    // console.log(req.cookies);
    if (req.cookies.jwt) {
        try {
            //1) verify the token
            console.log("Here verify token: ", fixedToken)
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,
                process.env.JWT_SECRET
            );

            console.log("", decoded);

            //2) Check if the user still exists
            db.query('SELECT * FROM users WHERE User_ID = ?', [decoded.id], (error, result) => {
                console.log(result);

                if (!result) {
                    return next();
                }

                req.user = result[0];
                // console.log("user is")
                // console.log(req.user);
                return next();

            });
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        next();
    }

}

exports.logout = async (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });

    res.status(200).redirect('/');
}



