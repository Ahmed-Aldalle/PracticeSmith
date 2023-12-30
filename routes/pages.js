const mysql = require("mysql");
const express = require('express');
const authController = require('../controllers/auth');
const teamController = require('../controllers/team');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const pageController = require('../controllers/pages');
const authRoutes = require('../routes/auth')
var nodemailer = require('nodemailer');
var randtoken = require('rand-token');

// let configuration = {
//   host: "localhost",
//   user: "root",
//   password: "boobdrag3",
//   database: "ps"
// };

let configuration = {
  host: "practice-smith-db-do-user-12690371-0.b.db.ondigitalocean.com",
  user: "doadmin",
  password: "AVNS_5Ufid5XorBVrhv_bUL8",
  port: "25060",
  database: "ps"
}

const db = mysql.createConnection(configuration);

///////////////////////////////////////


// send contact us
function sendContactEmail(senderEmail, senderName, senderMessage) {
  var email = senderEmail;
  var mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'practicesmithweb@gmail.com', // Your email id
      pass: 'msonjdvtjbekcwfw'
      // Your password


    }
  });
  
  var messageTemplate = "\n" + "Name: " + senderName + "\n" + "Email: " + senderEmail + "\n" + "Message: " + senderMessage;  
  console.log(messageTemplate)
  var mailOptions = {
    from: 'practicesmithweb@gmail.com',
    to: "practicesmithweb@gmail.com",
    subject: 'Message from a user.',
    text: `You got a message from
    ${messageTemplate}`,
    replyTo: senderEmail
  };
  console.log("Sending this email:", email)
  mail.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("failure")
      console.log("error is:", error)
      console.log(1)
    } else {
      console.log(0)
      console.log("sucess email")
    }
  });
}


//send email
function sendEmail(email, token) {
  var email = email;
  var token = token;
  var mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'practicesmithweb@gmail.com', // Your email id
      pass: 'msonjdvtjbekcwfw'
      // Your password


    }
  });

  console.log("token in send email function: ", token)
  var mailOptions = {
    from: 'practicesmithweb@gmail.com',
    to: email,
    subject: 'Reset Password Link - Practice smith',
    html: '<p>You requested for reset password, kindly use this <a href="http://147.182.228.52:2001/reset-password?email=' + email + '">link</a> to reset your password</p>'
  };
  console.log("Sending this email:", email)
  mail.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("failure")
      console.log("error is:", error)
      console.log(1)
    } else {
      console.log(0)
      console.log("sucess email")
    }
  });
}



// router.get('/', authController.isLoggedIn, (req, res) => {
//   res.render('login', {
//     user: req.user
//   });
// });



/* send contact us email*/
router.post('/send-contact-email', function (req, res){
  var senderEmail = req.body.contacterEmail;
  var senderMessage = req.body.messageField; 
  var senderName = req.body.contacterName;

  var sentProcess = sendContactEmail(senderEmail, senderName, senderMessage);

  if (sentProcess != '0') {
    type = 'success';
    msg = 'The reset password link has been sent to your email address';
  } else {
    type = 'error';
    msg = 'Something goes to wrong. Please try again';
  }

  var message = msg;
    //console.log("What message is here:", token)
    req.flash(type, message);
    //res.redirect('/login');
    res.redirect('..');
  
})

/* send reset password link in email */
router.post('/reset-password-email', function (req, res, next) {
  var email = req.body.email;

  //console.log(sendEmail(email, fullUrl));
  db.query('SELECT * FROM users WHERE Email =?', [email], async (err, result) => {
    if (err) throw err;
    var type = ''
    var msg = ''
    console.log(result[0]);
    if (result[0].Email.length > 0) {
      var token = randtoken.generate(20);
      var sent = sendEmail(email, token);
      if (sent != '0') {
        // var data = {
        //     token: token
        // }
        // db.query('UPDATE users SET token= ? WHERE Email =?', [token, email], async (err, result) => {
        //   if (err) throw err
        // })
        type = 'success';
        msg = 'The reset password link has been sent to your email address';
      } else {
        type = 'error';
        msg = 'Something goes to wrong. Please try again';
      }
    } else {
      console.log('2');
      type = 'error';
      msg = 'The Email is not registered with us';
    }
    var message = msg;
    //console.log("What message is here:", token)
    req.flash(type, message);
    res.redirect('/login');
  });
})


router.get('/reset-password', function (req, res, next) {
  res.render('update', { email: req.query.email })
});











// router.get('/updatePassword', (req, res) => {
//   res.render('updatePassword')
// });


/* update password to database */
router.post('/update-password', async (req, res, next) => {
  console.log("I'm inside update password function")
  //var token = req.body.token;
  var emailSend = req.body.email;
  var password = req.body.password;
  // console.log("what token is: ", token)
  //console.log("email with token sent: ", emailSend)
  //token = String(token)
  db.query('SELECT * FROM users WHERE Email = ?', [emailSend], async (err, result) => {
    console.log("what does user have here: ", result)
    if (err) throw err;
    var type
    var msg
    if (result.length > 0) {
      let hashedPassword = await bcrypt.hash(password, 8);

      var saltRounds = 10;

      var hash = bcrypt.hash(password, saltRounds);
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
          // var data = {
          //     password: hash
          // }
          db.query('UPDATE users SET Password = ? WHERE Email =?', [hashedPassword, emailSend], async (err, result) => {
            if (err) throw err
          });
        });
      });
      type = 'success';
      msg = 'Your password has been updated successfully';
    } else {
      console.log('2');
      type = 'success';
      msg = 'Invalid link; please try again';
    }
    var message = msg;
    req.flash(type, message);
    res.redirect('/login');
  });
})

router.get('/test', (req, res) => {
  res.render('test')
});

router.get('/forgot', (req, res) => {
  res.render('forgot');
});



///////////////////////////////////

router.get('/', authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.redirect('/HomePage')

  } else {
    res.redirect('/login');
  }
});

// router.get('/register', (req, res) => {
//   res.render('register')
// });

router.get('/login', (req, res) => {
  db.query('SELECT Email FROM users', (err, rows) => {
    //console.log("emails",rows)
    var userEmails = []
    //console.log("first index: ", rows[0])
    //var newSet = JSON.stringify(rows)
    //console.log("First index: ",rows[0].Email)
    //console.log("Len : ",rows.length)

    for (var i = 0; i < rows.length; i++) {
      userEmails[i] = rows[i].Email;
    }

    //console.log("userEmails: ", userEmails[0])

    //userEmails = JSON.stringify(userEmails);


    //console.log("PassedA:", passedA);
    //console.log(passedA.length);

    res.render('login', { userEmails })
  });

});

router.get('/practice/:teamid', authController.isLoggedIn, async (req, res, next) => {

  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var team_names;

  if (req.user) {
    var team_id = req.params.teamid;
    console.log("team_id", team_id)
    //var team_id = 1;

    // populate teams list
    db.query("SELECT Team_Name, Team_ID from teams WHERE User_ID = ?", [decoded.id], (err, results) => {
      if (!err) {
        //var result = Object.values(JSON.parse(JSON.stringify(results)))
        //note
        team_names_ids = results
        //console.log(team_name)
      }
      else {
        console.log(err)
      }
    })

    // populate dropdowns based on current team selection

    db.query('SELECT Players_ID FROM teams_players WHERE User_ID = ? AND Team_ID = ?', [decoded.id, team_id], (err2, players_ids) => {
      if (!err2) {

        //console.log(players_ids)
        if (players_ids.length != 0) {
          var playerIDs = [];
          for (let i = 0; i < players_ids.length; i++) {
            playerIDs[i] = players_ids[i].Players_ID;
          }
        }
        else {
          var playerIDs;
          playerIDs = 0
        }

        db.query('SELECT P_Name FROM players WHERE User_ID = ? AND Players_ID IN (?)', [decoded.id, playerIDs], (err3, players_names) => {

          if (!err3) {
            // if no players on team

            //console.log("players", players_names)

            db.query('SELECT Drill_ID FROM teams_drills WHERE User_ID = ? AND Team_ID = ?', [decoded.id, team_id], (err4, drill_ids) => {
              if (!err4) {

                //console.log(drill_ids)
                if (drill_ids.length != 0) {
                  var drillIDs = [];
                  for (let i = 0; i < drill_ids.length; i++) {
                    drillIDs[i] = drill_ids[i].Drill_ID;
                  }
                }
                else {
                  var drillIDs;
                  drillIDs = 0
                }

                db.query('SELECT Dr_Type, Dr_Category, Dr_Name FROM drills WHERE User_ID = ? AND Drill_ID IN (?)', [decoded.id, drillIDs], (err5, drills) => {
                  if (!err5) {

                    //console.log("drills", drills)

                    res.render('practice2', {
                      user: req.user, drillVal: drills, playerVal: players_names, teamVal: team_names_ids
                    });
                  }
                  else {
                    console.log(err5)
                  }
                });
              }
              else {
                console.log(err4)
              }
            })

          }
          else {
            console.log(err3)
          }
        });


      } else {
        console.log(err2);
      }
    });

  } else {
    console.log(err);
  }

});

// edit a plan 
router.get('/edit-plan/:planid', authController.isLoggedIn, async (req, res, next) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var planid = req.params.planid
  console.log(planid)
  // QUERIES FOR FILLING IN INPUT FIELDS WITH SAVED PLAN INFORMATION
  db.query('SELECT Plan, Name, Created FROM plans WHERE Plan_ID = ? AND User_ID = ?', [planid, decoded.id], (err, rows) => {
    if (!err) {
      // var planArr = Object.values(JSON.parse(JSON.stringify(rows)));
      //var newArr = JSON.parse(planArr);
      var planArr = rows
      var planName = planArr[0].Name;
      var plandate = planArr[0].Created

      plandate = Object.values(JSON.parse(JSON.stringify(plandate)))
      plandate = plandate.slice(0, 10)
      plandate = ''.concat(plandate).replaceAll(',', "")
      // var finalplandate = new Date(plandate)
      // finalplandate = finalplandate.getMonth() + 1 + '/' + finalplandate.getDate() + '/' + finalplandate.getFullYear()

      var arr2 = planArr[0].Plan;
      var newArr = JSON.parse(arr2);

      var planstarttime = newArr.plan_start_time

      var playersPo = newArr.players_positions;
      var playersPositionJson = JSON.parse(playersPo)
      var positionsArray=[]
      for (var i = 0; i < playersPositionJson.length; i++) {
        keyArray = []
        poPlayersArray = []
        for (key in playersPositionJson[i]) {
          keyArray.push(key);
          var tempvalue = playersPositionJson[i][key];
          poPlayersArray.push(tempvalue)
          console.log("poPlayersArray: ",poPlayersArray)
          console.log('Key: '+ key + ' Value: ' + playersPositionJson[i][key]);
        }

       // tempPo = [poPlayersArray.toSt]

        positionsArray[i] = {positions: keyArray, assignedPlayers: poPlayersArray}
      }

      var objectsA = []
      var num_rows = 0
      if (Array.isArray(newArr.start_times)) {
        num_rows = newArr.start_times.length
        for (var i = 0; i < newArr.start_times.length; i++) {
          //console.log(newArr.start_times)
          // change start times to 12 hour time
          // var start_hours = newArr.start_times[i].split(":")[0]
          // var start_minutes = newArr.start_times[i].split(":")[1]
          // var AmOrPmStart = start_hours >= 12 ? 'pm' : 'am';
          // start_hours = (start_hours % 12) || 12;
          // var finalStartTime = start_hours + ":" + start_minutes + AmOrPmStart;

          // var end_hours = newArr.end_times[i].split(":")[0]
          // var end_minutes = newArr.end_times[i].split(":")[1]
          // var AmOrPmEnd = end_hours >= 12 ? 'pm' : 'am';
          // end_hours = (end_hours % 12) || 12;
          // var finalEndTime = end_hours + ":" + end_minutes + AmOrPmEnd;

          objectsA[i] = {
            drill_name: newArr.drill_name[i], drill_type: newArr.drill_type[i],
            drill_category: newArr.drill_category[i], startTime: newArr.start_times[i], endTime: newArr.end_times[i],
            notes_comments: newArr.notes[i], pic_link: newArr.pics[i], duration: newArr.drill_duration[i],
            positions: positionsArray[i].positions
          };
          
          
          
        }
      }
      else {
        num_rows = 1
        // var start_hours = newArr.start_times.split(":")[0]
        // var start_minutes = newArr.start_times.split(":")[1]
        // var AmOrPmStart = start_hours >= 12 ? 'pm' : 'am';
        // start_hours = (start_hours % 12) || 12;
        // var finalStartTime = start_hours + ":" + start_minutes + AmOrPmStart;

        // var end_hours = newArr.end_times.split(":")[0]
        // var end_minutes = newArr.end_times.split(":")[1]
        // var AmOrPmEnd = end_hours >= 12 ? 'pm' : 'am';
        // end_hours = (end_hours % 12) || 12;
        // var finalEndTime = end_hours + ":" + end_minutes + AmOrPmEnd;

        objectsA[0] = {
          drill_name: newArr.drill_name, drill_type: newArr.drill_type,
          drill_category: newArr.drill_category, startTime: newArr.start_times, endTime: newArr.end_times,
          notes_comments: newArr.notes, pic_link: newArr.pics, duration: newArr.drill_duration,
          positions: positionsArray[0].positions
        };
        

        //console.log(objectsA[0].startTime)
      }
      
      console.log(objectsA)

      // var hours = newArr.plan_start_time.split(":")[0]
      // var minutes = newArr.plan_start_time.split(":")[1]
      // var AmOrPm = hours >= 12 ? 'pm' : 'am';
      // hours = (hours % 12) || 12;
      // var finalTime = "Start Time: " + hours + ":" + minutes + AmOrPm;

      db.query('SELECT Team_ID FROM teams_plans WHERE Plan_ID = ? AND User_ID = ?', [planid, decoded.id], (err2, teamid) => {
        if (!err2) {

          db.query('SELECT Team_Name FROM teams WHERE Team_ID = ? AND User_ID = ?', [teamid[0].Team_ID, decoded.id], (err3, teamname) => {
            if (!err3) {

              // THESE ARE THE SAME QUERIES FOR /practice ! Just slightly modified since we already know the team_id ( plans are saved to a team ;) )!
              db.query('SELECT Players_ID FROM teams_players WHERE User_ID = ? AND Team_ID = ?', [decoded.id, teamid[0].Team_ID], (err4, players_ids) => {
                if (!err4) {


                  if (players_ids.length != 0) {
                    var playerIDs = [];
                    for (let i = 0; i < players_ids.length; i++) {
                      playerIDs[i] = players_ids[i].Players_ID;
                    }
                  }
                  else {
                    var playerIDs;
                    playerIDs = 0
                  }

                  db.query('SELECT P_Name FROM players WHERE User_ID = ? AND Players_ID IN (?)', [decoded.id, playerIDs], (err5, players_names) => {

                    if (!err5) {
                      // if no players on team

                      //console.log("players", players_names)

                      db.query('SELECT Drill_ID FROM teams_drills WHERE User_ID = ? AND Team_ID = ?', [decoded.id, teamid[0].Team_ID], (err6, drill_ids) => {
                        if (!err6) {


                          if (drill_ids.length != 0) {
                            var drillIDs = [];
                            for (let i = 0; i < drill_ids.length; i++) {
                              drillIDs[i] = drill_ids[i].Drill_ID;
                            }
                          }
                          else {
                            var drillIDs;
                            drillIDs = 0
                          }

                          db.query('SELECT Dr_Type, Dr_Category, Dr_Name FROM drills WHERE User_ID = ? AND Drill_ID IN (?)', [decoded.id, drillIDs], (err7, drills) => {
                            if (!err7) {
                              var drill_array = []
                              for (let i = 0; i < drills.length; i++) {
                                drill_array[i] = {
                                  dr_type: drills[i].Dr_Type, dr_cat: drills[i].Dr_Category, dr_name: drills[i].Dr_Name
                                }
                              }

                              var player_array = []
                              for (let i = 0; i < players_names.length; i++) {
                                player_array[i] = {
                                  p_name: players_names[i].P_Name
                                }
                              }

                              console.log(player_array)


                              var team_name = teamname[0].Team_Name
                              var team_id = teamid[0].Team_ID
                              //console.log(objectsA)
                              res.render('edit-plan', {positionsArray, objectsA, planName, planstarttime, plandate, team_id, team_name, num_rows, drill_array, player_array, planid});
                            }
                            else {
                              console.log(err7)
                            }
                          });
                        }
                        else {
                          console.log(err6)
                        }
                      })

                    }
                    else {
                      console.log(err5)
                    }
                  });


                } else {
                  console.log(err4);
                }
              });

            }
            else {
              console.log(err3)
            }
          })
        }
        else {
          console.log(err2)
        }
      })

    }
    else {
      console.log(err)
    }

  })
})

router.get('/createteam', async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var TheTeamNames = [];
  db.query('SELECT * from teams where User_ID = ?', [decoded.id], (err, existingTeams)=>{
    if(!err){
      if(existingTeams.length !=0){
        for(var i = 0; i<existingTeams.length-1; i++)
          TheTeamNames[i]=existingTeams[i].Team_Name;
      }
      
      res.render('team', {TheTeamNames});
      console.log(TheTeamNames)
    }
    else{
      console.log(err)
    }
  })
  
});


const dbQuery = (query, params) =>
  new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

router.get('/viewteam/:teamid', async (req, res) => {
  const team_id = req.params.teamid;
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  db.query('SELECT Team_Name from teams where Team_ID = ? and User_ID = ?', [team_id, decoded.id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const team_result = Object.values(JSON.parse(JSON.stringify(result)));
      const team_name = team_result[0].Team_Name;

      db.query('SELECT * FROM teams_players WHERE Team_ID = ? AND User_ID = ?', [team_id, decoded.id], (err1, rows1) => {
        if (err1) return console.log(err1);
        const playerIDs = rows1.map(row => row.Players_ID);

        db.query('SELECT * FROM teams_drills WHERE Team_ID = ? AND User_ID = ?', [team_id, decoded.id], (err2, rows2) => {
          if (err2) return console.log(err2);
          const drillIDs = rows2.map(row => row.Drill_ID);

          db.query('SELECT * FROM teams_plans WHERE Team_ID = ? AND User_ID = ?', [team_id, decoded.id], (err3, rows3) => {
            if (err3) return console.log(err3);
            const planIDs = rows3.map(row => row.Plan_ID);

            const noPlayers = playerIDs.length === 0;
            const noDrills = drillIDs.length === 0;
            const noPlans = planIDs.length === 0;

            if (noPlayers && noDrills && noPlans) {
              res.render('viewteam', { result, rows2: [], rows4: [], rows6: [], team_name, team_id, playerIDs, drillIDs, planIDs });
            } else {
              const tasks = [
                noPlayers ? null : dbQuery('SELECT * from players WHERE Players_ID IN (?) AND User_ID = ?', [playerIDs, decoded.id]),
                noDrills ? null : dbQuery('SELECT * FROM drills WHERE Drill_ID IN (?) AND User_ID = ?', [drillIDs, decoded.id]),
                noPlans ? null : dbQuery('SELECT * FROM plans WHERE Plan_ID IN (?) AND User_ID = ?', [planIDs, decoded.id]),
              ];

              Promise.all(tasks.map(task => task ? task.catch(e => e) : null)).then(([rows2, rows4, rows6]) => {
                if (rows2 instanceof Error) console.log(rows2);
                if (rows4 instanceof Error) console.log(rows4);
                if (rows6 instanceof Error) console.log(rows6);

                if (rows6 && rows6.length > 0) {
                  for (let i = 0; i < rows6.length; i++) {
                    rows6[i].Created = new Date(rows6[i].Created).toLocaleDateString('en-US');
                  }
                }

                res.render('viewteam', { result, rows2: rows2 || [], rows4: rows4 || [], rows6: rows6 || [], team_name, team_id, playerIDs, drillIDs, planIDs });
              });
            }
          });
        });
      });
    }
  });
});

router.get('/view-drills/:id', async (req, res) => {

  var team_id = req.params.id
  var team_name;

  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

  db.query('SELECT Team_Name from teams where Team_ID = ? and User_ID = ?', [team_id, decoded.id], (err1, result) => {
    if (!err1) {
      console.log(err1)
      var team_result = Object.values(JSON.parse(JSON.stringify(result)))
      team_name = team_result[0].Team_Name
    }

  })

  db.query('SELECT * FROM drills WHERE Team_ID = ? AND User_ID = ?', [team_id, decoded.id], (err, rows) => {
    if (!err) {
      console.log(rows);
      res.render('view-drills', { rows, team_name });
    } else {
      console.log(err);
    }
  });

});


router.get('/view-plan/:id', async (req, res) => {
  var planArr;
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  db.query('SELECT Plan, Name, Created FROM plans WHERE Plan_ID = ? AND User_ID = ?', [req.params.id, decoded.id], (err, rows) => {
    if (!err) {
      // var planArr = Object.values(JSON.parse(JSON.stringify(rows)));
      //var newArr = JSON.parse(planArr);
      var planArr = rows
      var planName = planArr[0].Name;
      var plandate = planArr[0].Created
      plandate = Object.values(JSON.parse(JSON.stringify(plandate)))
      plandate = plandate.slice(0, 10)
      plandate = ''.concat(plandate).replaceAll(',', "")
      console.log(plandate)
      var finalplandate_day = plandate.split("-")[2]
      var finalplandate_month = plandate.split("-")[1]
      var finalplandate_year = plandate.split("-")[0]
      var finalplandate = finalplandate_month + "/" + finalplandate_day + "/" + finalplandate_year

      
      
      var arr2 = planArr[0].Plan;
      var newArr = JSON.parse(arr2);
      
      
      var playersPo = newArr.players_positions;
      var playersPositionJson = JSON.parse(playersPo)
      var positionsArray=[]
      var playersPC = 0
      for (var i = 0; i < playersPositionJson.length; i++) {
        console.log(i)
        keyArray = []
        poPlayersArray = []
        for (key in playersPositionJson[i]) {
          keyArray.push(key);
          var tempvalue = playersPositionJson[i][key];
          poPlayersArray.push(tempvalue)
          console.log("poPlayersArray: ",poPlayersArray)
          //console.log('Key: '+ key + ' Value: ' + playersPositionJson[i][key]);
        }

       // tempPo = [poPlayersArray.toSt]

        positionsArray[i] = {positions: keyArray, assignedPlayers: poPlayersArray}
      }

      console.log(positionsArray)
     // var xy = playersPo2[0];
      //console.log("playersPo has: ", xy[0])
      console.log("------------------------------------------------------------------")
      var stats1 = newArr.stats1
      var stats2 = newArr.stats2
      var stats3 = newArr.stats3
      var stats4 = newArr.stats4

      console.log("what are stats: ",stats1, stats2, stats3, stats4)
      //console.log(newArr)

      var objectsA = []
      if (Array.isArray(newArr.start_times)) {
        console.log('here')
        for (var i = 0; i < newArr.start_times.length; i++) {
          // change start times to 12 hour time
          var start_hours = newArr.start_times[i].split(":")[0]
          var start_minutes = newArr.start_times[i].split(":")[1]
          var AmOrPmStart = start_hours >= 12 ? 'pm' : 'am';
          start_hours = (start_hours % 12) || 12;
          var finalStartTime = start_hours + ":" + start_minutes + AmOrPmStart;

          var end_hours = newArr.end_times[i].split(":")[0]
          var end_minutes = newArr.end_times[i].split(":")[1]
          var AmOrPmEnd = end_hours >= 12 ? 'pm' : 'am';
          end_hours = (end_hours % 12) || 12;
          var finalEndTime = end_hours + ":" + end_minutes + AmOrPmEnd;

          // objectsA[i] = {
          //   player_name: newArr.player_name[i], drill_name: newArr.drill_name[i], drill_type: newArr.drill_type[i],
          //   drill_category: newArr.drill_category[i], startTime: finalStartTime, endTime: finalEndTime,
          //   notes_comments: newArr.notes[i], pic_link: newArr.pics[i], duration: newArr.drill_duration[i]
          // };

          objectsA[i] = { startTime: finalStartTime, endTime: finalEndTime, drill_name: newArr.drill_name[i], drill_type: newArr.drill_type[i], positions: positionsArray[i].positions, player_name: positionsArray[i].assignedPlayers, notes_comments: newArr.notes[i], pic_link: newArr.pics[i]}

          }

          //objectsA[0].startTime
        }
      
      else {

        var start_hours = newArr.start_times.split(":")[0]
        var start_minutes = newArr.start_times.split(":")[1]
        var AmOrPmStart = start_hours >= 12 ? 'pm' : 'am';
        start_hours = (start_hours % 12) || 12;
        var finalStartTime = start_hours + ":" + start_minutes + AmOrPmStart;

        var end_hours = newArr.end_times.split(":")[0]
        var end_minutes = newArr.end_times.split(":")[1]
        var AmOrPmEnd = end_hours >= 12 ? 'pm' : 'am';
        end_hours = (end_hours % 12) || 12;
        var finalEndTime = end_hours + ":" + end_minutes + AmOrPmEnd;

        // objectsA[0] = {
        //   player_name: newArr.player_name, drill_name: newArr.drill_name, drill_type: newArr.drill_type,
        //   drill_category: newArr.drill_category, startTime: finalStartTime, endTime: finalEndTime,
        //   notes_comments: newArr.notes, pic_link: newArr.pics, duration: newArr.drill_duration
        // };
        //console.log(objectsA[0].startTime)

        objectsA[0] = {startTime: finalStartTime, endTime: finalEndTime, drill_name: newArr.drill_name, drill_type: newArr.drill_type, positions: positionsArray[0].positions, player_name: positionsArray[0].assignedPlayers, notes_comments: newArr.notes[0], pic_link: newArr.pics[0]}

      }


      var hours = newArr.plan_start_time.split(":")[0]
      var minutes = newArr.plan_start_time.split(":")[1]
      var AmOrPm = hours >= 12 ? 'pm' : 'am';
      hours = (hours % 12) || 12;
      var finalTime = "Start Time: " + hours + ":" + minutes + AmOrPm;


      //console.log(planName);
      //res.render('view-plan')
      //console.log("testing view plan")
     // console.log("objectsA ",objectsA)

      // var objectsB =  [
      //   {
      //     positions: [ 'C', 'P' ],
      //     player_name: [ ['Player1LN Player1', 'Player2FN Player2LN' , 'Player3FN Player3LN' , 'Player4FN Player4LN'],
      //       ['l1 player1' , 'l2 player2' ,'l3 player3' ,'l4 player4' , 'l5 player5' ,'l6 player6']
      //     ]
      //   },
      //   {
      //     positions: [ '1B', 'C', 'Runners' ],
      //     player_name: [
      //       ['Player1LN Player1','Player2FN Player2LN','Player3FN Player3LN'],
      //       ['l17 player17','l18 player18','l19 player19','l20 player20'],
      //       ['l3 player3','l4 player4','l5 player5','l6 player6']
      //     ]
      //   },
      //   {
      //     positions: [ '3B', '1B', 'C', 'Pitchers' ],
      //     player_name: [
      //       ['Player1LN Player1','Player2FN Player2LN'],
      //       ['l1 player1','l2 player2'],
      //       ['l11 player11','l16 player16','l17 player17','l18 player18'],
      //       ['l11 player11','l13 player13']
      //     ]
      //   }
      // ]
      console.log("objectsB ",objectsA)

      res.render('view-plan', { objectsA, planName, finalTime, finalplandate, stats1, stats2, stats3, stats4 });
    }
    else {
      console.log(err)
    }

  })
})

router.get('/select-team', async (req, res) => {

  const decoded = await promisify(jwt.verify)(req.cookies.jwt,
    process.env.JWT_SECRET);

    db.query('SELECT teams.*, COUNT(DISTINCT teams_players.Players_ID) AS numPlayers, COUNT(DISTINCT teams_drills.Drill_ID) AS numDrills, COUNT(DISTINCT teams_plans.Plan_ID) AS numPlans FROM teams LEFT JOIN teams_players ON teams.Team_ID = teams_players.Team_ID LEFT JOIN teams_drills ON teams.Team_ID = teams_drills.Team_ID LEFT JOIN teams_plans ON teams.Team_ID = teams_plans.Team_ID WHERE teams.User_ID = ? GROUP BY teams.Team_ID', [decoded.id], (err, rows) => {
      if (!err) {
        res.render('select-team', { rows });
      } else {
        console.log(err);
      }
    });
    
})

router.get('/my-teams', async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  db.query('SELECT * FROM teams WHERE User_ID = ?', [decoded.id], (err1, result1) => {
    if (err1) {
      console.log(err1);
      res.status(500).send('Internal server error');
    } else {
      res.json(result1);
    }
  });
});



// router.get('/plans', async (req, res) => {

//   const decoded = await promisify(jwt.verify)(req.cookies.jwt,
//     process.env.JWT_SECRET);

//   db.query('SELECT * FROM plans WHERE User_ID = ?', [decoded.id], (err, rows) => {
//     if (!err) {
//       res.render('view-select-plan', { rows });
//     } else {
//       console.log(err);
//     }
//   })
// })

router.get('/view-draw-drill/:teamid/:rowid', async (req, res) => {

  res.render('view-draw-drill')
})

router.get('/view-draw-drill/edit-plan/:planid/:rowid', async (req, res) => {

  res.render('view-draw-drill-edit-plan')
})

router.get('/draw-drill/edit-plan/:planid/:teamid/:rowid', async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var team_id = req.params.teamid
  var plan_id = req.params.planid
  var row_id = req.params.rowid
  db.query('SELECT Players_ID FROM teams_players WHERE Team_ID = ? AND User_ID = ?', [team_id, decoded.id], (error, result) => {
    if (!error) {

      // if no players on team
      if (result.length != 0) {
        var player_IDs = [];
        for (let i = 0; i < result.length; i++) {
          player_IDs[i] = result[i].Players_ID;
        }
      }
      else {
        var player_IDs;
        player_IDs = 0
      }

      db.query('SELECT * FROM players WHERE User_ID = ? AND Players_ID IN (?)', [decoded.id, player_IDs], (error2, players) => {
        if (!error2) {
          //console.log(players)
          res.render('draw-drill-edit-plan', { players })
        }
        else {
          console.log(error2)
        }
      })
    }
    else {
      console.log(error)
    }

  })
})

router.get('/draw-drill/:teamid/:rowid', async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var team_id = req.params.teamid
  db.query('SELECT Players_ID FROM teams_players WHERE Team_ID = ? AND User_ID = ?', [team_id, decoded.id], (error, result) => {
    if (!error) {

      // if no players on team
      if (result.length != 0) {
        var player_IDs = [];
        for (let i = 0; i < result.length; i++) {
          player_IDs[i] = result[i].Players_ID;
        }
      }
      else {
        var player_IDs;
        player_IDs = 0
      }

      db.query('SELECT * FROM players WHERE User_ID = ? AND Players_ID IN (?)', [decoded.id, player_IDs], (error2, players) => {
        if (!error2) {
          //console.log(players)
          res.render('draw-drill', { players })
        }
        else {
          console.log(error2)
        }
      })
    }
    else {
      console.log(error)
    }

  })
})


router.get('/players', pageController.getPlayers);

router.get('/plans', pageController.getPlans);

router.get('/drills', pageController.getDrills);
//router.get('/New', pageController.getNew);

router.get('/HomePage', async (req, res) => {

  const decoded = await promisify(jwt.verify)(req.cookies.jwt,
    process.env.JWT_SECRET);

  var NoPlanBool = false;
  var NoTeamBool = false;
  var theTeamID=0;
  db.query('SELECT * FROM teams WHERE User_ID = ? LIMIT 1', [decoded.id], (err, teamrow) => {
    if (!err) {

      if (teamrow.length != 0) {
        NoTeamBool = false;
        // console.log("team rows:");
        // console.log(teamrow);
        // console.log("team.User_ID:");
        // console.log(teamrow[0].User_ID);
        theTeamID = teamrow[0].Team_ID
        // console.log("ID:")
        // console.log(theTeamID)
        db.query('SELECT Players_ID FROM teams_players WHERE User_ID = ? AND Team_ID = ?', [decoded.id, teamrow[0].Team_ID], (err2, playeridrow) => {
          if (!err2) {
            // console.log("player rows:")
            // console.log(playeridrow);

            // if no players on team
            if (playeridrow.length != 0) {
              var someIDS = [];
              for (let i = 0; i < playeridrow.length; i++) {
                someIDS[i] = playeridrow[i].Players_ID;
              }
            }
            else {
              var someIDS;
              someIDS = 0
            }

            db.query('SELECT * FROM players WHERE User_ID = ? AND Players_ID IN (?)', [decoded.id, someIDS], (err3, playerrow) => {
              if (!err3) {
                // console.log("players:");
                // console.log(playerrow);
                db.query('SELECT Plan_ID FROM teams_plans WHERE User_ID = ? AND Team_ID =?', [decoded.id, teamrow[0].Team_ID], (err4, planidrow) => {
                  if (!err4) {

                    if (planidrow.length != 0) {
                      NoPlanBool=false;
                      var planIDs = [];
                      for (let i = 0; i < planidrow.length; i++) {
                        planIDs[i] = planidrow[i].Plan_ID;
                      }
                    }
                    else {
                      var planIDs;
                      NoPlanBool = true;
                      planIDs = 0;
                    }

                    db.query('SELECT * FROM plans WHERE User_ID = ? AND Plan_ID IN (?)', [decoded.id, planIDs], (err5, planrow) => {
                      if (!err5) {

                        db.query('SELECT * FROM teams WHERE User_ID = ?', [decoded.id], (err6, allteams) => {
                          if (!err6) {

                            db.query('SELECT Drill_ID FROM teams_drills WHERE User_ID = ? AND Team_ID = ?', [decoded.id, teamrow[0].Team_ID], (err7, DrIds) => {
                              if (!err7) {
                                // console.log("DrIds")
                                // console.log(DrIds)
                                if (DrIds.length != 0) {
                                  var DrillIDs = [];
                                  for (let i = 0; i < DrIds.length; i++) {
                                    DrillIDs[i] = DrIds[i].Drill_ID;
                                  }
                                }
                                else {
                                  var DrillIDs;
                                  DrillIDs = 0;
                                }
                                db.query('SELECT * from drills where User_ID = ? AND Drill_ID in (?)', [decoded.id, DrillIDs], (err8, drillrow) => {
                                  if (!err8) {
                                    // console.log("Drillrow");
                                    // console.log(drillrow);
                                    res.render('home-page', { allteams, teamrow, playerrow, planrow, NoTeamBool, drillrow, theTeamID, NoPlanBool });
                                  }
                                  else {
                                    console.log(err8);
                                  }
                                });
                              }
                              else {
                                console.log(err7);
                              }
                            });

                          }
                          else {
                            console.log(err6);
                          }
                        });
                      }
                      else {
                        console.log(err5);
                      }
                    });

                  }
                  else {
                    console.log(err4);
                  }
                });

              }
              else {
                console.log(err3);
              }

            });

          }
          else {
            console.log(err2);
          }
        });

      }
      else {
        NoTeamBool = true;
        console.log("There is no team")
        teamrow = 0;
        playerrow = 0;
        planrow = 0;
        allteams = 0;
        drillrow = 0;
        res.render('home-page', { allteams, teamrow, playerrow, planrow, NoTeamBool, drillrow, theTeamID, NoPlanBool });
      }

    }
    else {
      console.log(err);
    }
  });

})

router.get('/HomePage/:id', async (req, res) => {

  const decoded = await promisify(jwt.verify)(req.cookies.jwt,
    process.env.JWT_SECRET);

  var NoTeamBool = false;
  
  db.query('SELECT * FROM teams WHERE User_ID = ? AND Team_ID = ?', [decoded.id, req.params.id], (err, teamrow) => {
    if (!err) {

      if (teamrow.length != 0) {
        NoTeamBool = false;
        // console.log("team rows:");
        // console.log(teamrow);
        // console.log("team.User_ID:");
        // console.log(teamrow[0].User_ID);
        theTeamID = req.params.id
        db.query('SELECT Players_ID FROM teams_players WHERE User_ID = ? AND Team_ID = ?', [decoded.id, teamrow[0].Team_ID], (err2, playeridrow) => {
          if (!err2) {
            // console.log("player rows:")
            // console.log(playeridrow);

            // if no players on team
            if (playeridrow.length != 0) {
              var someIDS = [];
              for (let i = 0; i < playeridrow.length; i++) {
                someIDS[i] = playeridrow[i].Players_ID;
              }
            }
            else {
              var someIDS;
              someIDS = 0
            }

            db.query('SELECT * FROM players WHERE User_ID = ? AND Players_ID IN (?)', [decoded.id, someIDS], (err3, playerrow) => {
              if (!err3) {
                // console.log("players:");
                // console.log(playerrow);
                db.query('SELECT Plan_ID FROM teams_plans WHERE User_ID = ? AND Team_ID =?', [decoded.id, teamrow[0].Team_ID], (err4, planidrow) => {
                  if (!err4) {
                    if (planidrow.length != 0) {
                      NoPlanBool=false;
                      var planIDs = [];
                      for (let i = 0; i < planidrow.length; i++) {
                        planIDs[i] = planidrow[i].Plan_ID;
                      }
                    }
                    else {
                      var planIDs;
                      NoPlanBool = true;
                      planIDs = 0;
                    }

                    db.query('SELECT * FROM plans WHERE User_ID = ? AND Plan_ID IN (?)', [decoded.id, planIDs], (err5, planrow) => {
                      if (!err5) {
                        db.query('SELECT * FROM teams WHERE User_ID = ?', [decoded.id], (err6, allteams) => {
                          if (!err6) {
                            db.query('SELECT Drill_ID FROM teams_drills WHERE User_ID = ? AND Team_ID = ?', [decoded.id, teamrow[0].Team_ID], (err7, DrIds) => {
                              if (!err7) {
                                // console.log("DrIds")
                                // console.log(DrIds)
                                if (DrIds.length != 0) {
                                  var DrillIDs = [];
                                  for (let i = 0; i < DrIds.length; i++) {
                                    DrillIDs[i] = DrIds[i].Drill_ID;
                                  }
                                }
                                else {
                                  var DrillIDs;
                                  DrillIDs = 0;
                                }
                                db.query('SELECT * from drills where User_ID = ? AND Drill_ID in (?)', [decoded.id, DrillIDs], (err8, drillrow) => {
                                  if (!err8) {
                                    // console.log("Drillrow");
                                    // console.log(drillrow);
                                    res.render('home-page', { allteams, teamrow, playerrow, planrow, NoTeamBool, drillrow, theTeamID, NoPlanBool });
                                  }
                                  else {
                                    console.log(err8);
                                  }
                                });
                              }
                              else {
                                console.log(err7);
                              }
                            });
                          }
                          else {
                            console.log(err6);
                          }
                        })
                      }
                      else {
                        console.log(err5);
                      }
                    });
                  }
                  else {
                    console.log(err4);
                  }
                });
              }
              else {
                console.log(err3);
              }
            });

          }
          else {
            console.log(err2);
          }
        });

      }
      else {
        NoTeamBool = true;
        console.log("There is no team");
        // console.log("team rows:");
        // console.log(teamrow);
        teamrow = 0;
        playerrow = 0;
        planrow = 0;
        allteams = 0;
        drillrow = 0;
        res.render('home-page', { allteams, teamrow, playerrow, planrow, NoTeamBool, drillrow, theTeamID, NoPlanBool });
      }

    }
    else {
      console.log(err);
    }
  });




})

module.exports = router;