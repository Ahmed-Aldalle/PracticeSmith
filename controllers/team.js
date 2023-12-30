const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } =
  require('util');
const e = require("express");
const { pid } = require("process");

// let configuration = {
//     host: "localhost",
//     user: "root",
//     password: "boobdrag3",
//     database: "ps" // Add database name here
// };

let configuration = {
  host: "practice-smith-db-do-user-12690371-0.b.db.ondigitalocean.com",
  user: "doadmin",
  password: "AVNS_5Ufid5XorBVrhv_bUL8",
  port: "25060",
  database: "ps"
}

const db = mysql.createConnection(configuration);


exports.uploadCsvDrills = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var { drillUploadName, drillUploadCategory, drillUploadType, drillUploadDescription, drillUploadUrl } = req.body;

  //console.log(firstNamePlayer, lastNamePlayer, player_upload_email)


  var fileArrayUpload = []

  db.query("SELECT MAX(Drill_ID) as dr_id FROM drills where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)
    var new_drill_id = 0;
    new_drill_id = Number(results[0].dr_id) + 1;
    console.log(new_drill_id)
    if (Array.isArray(drillUploadName)) {
      for (var x = 0; x < drillUploadName.length; x++) {
        if (drillUploadName[x].length === 0) {
          drillUploadName[x] = null;
        }
        if (drillUploadCategory[x].length === 0) {
          drillUploadCategory[x] = null;
        }
        if (drillUploadType[x].length === 0) {
          drillUploadType[x] = null;
        }
        if (drillUploadDescription[x].length === 0) {
          drillUploadDescription[x] = null;
        }
        if (drillUploadUrl[x].length === 0) {
          drillUploadUrl[x] = null;
        }
        var offset = -7;
        var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        fileArrayUpload[x] = [new_drill_id, drillUploadName[x], drillUploadCategory[x], drillUploadType[x], decoded.id, dateTime, drillUploadDescription[x], drillUploadUrl[x]]
        new_drill_id += 1;
      }
    }

    else { // only adding one player
      // check for blank inputs then turn them null if so
      if (drillUploadName.length === 0) {
        drillUploadName = null;
      }
      if (drillUploadCategory.length === 0) {
        drillUploadCategory = null;
      }
      if (drillUploadType.length === 0) {
        drillUploadType = null;
      }
      if (drillUploadDescription.length === 0) {
        drillUploadDescription = null;
      }
      if (drillUploadUrl.length === 0) {
        drillUploadUrl = null;
      }
      var offset = -7;
      var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      fileArrayUpload[0] = [new_drill_id, drillUploadName, drillUploadCategory, drillUploadType, decoded.id, dateTime, drillUploadDescription, drillUploadUrl]
    }
    console.log("list of data", fileArrayUpload)

    db.query("INSERT INTO drills (Drill_ID, Dr_Name, Dr_Category, Dr_Type, User_ID, Created, Description, Url) VALUES ?", [fileArrayUpload], (error, results2) => {
      if (error) console.log(error)
      res.redirect('/drills')
    });


  });

}
exports.uploadCsvTeamDrills = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const team_id = req.params.teamid;
  var { drillUploadName, drillUploadCategory, drillUploadType, drillUploadDescription, drillUploadUrl } = req.body;

  var fileArrayUpload = [];

  db.query("SELECT MAX(Drill_ID) as dr_id FROM drills where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1);
    var new_drill_id = Number(results[0].dr_id) || 0;
    new_drill_id++; // Increment the ID to get the next available ID
    console.log(new_drill_id);
    if (Array.isArray(drillUploadName)) {
      for (var x = 0; x < drillUploadName.length; x++) {
        [drillUploadName, drillUploadCategory, drillUploadType, drillUploadDescription, drillUploadUrl].forEach((field, index) => {
          if (field[x].length === 0) field[x] = null;
        });

        var offset = -7;
        var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        fileArrayUpload[x] = [new_drill_id, drillUploadName[x], drillUploadCategory[x], drillUploadType[x], decoded.id, dateTime, drillUploadDescription[x], drillUploadUrl[x]];
        new_drill_id += 1;
      }
    } else {
      [drillUploadName, drillUploadCategory, drillUploadType, drillUploadDescription, drillUploadUrl].forEach(field => {
        if (field.length === 0) field = null;
      });

      var offset = -7;
      var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      fileArrayUpload = [[new_drill_id, drillUploadName, drillUploadCategory, drillUploadType, decoded.id, dateTime, drillUploadDescription, drillUploadUrl]];
    }

    db.query("INSERT INTO drills (Drill_ID, Dr_Name, Dr_Category, Dr_Type, User_ID, Created, Description, Url) VALUES ?", [fileArrayUpload], async (error, results2) => {
      if (error) {
        console.log(error);
      } else {
        const insertTeamDrillPromises = fileArrayUpload.map(([drill_id]) => {
          return new Promise((resolve, reject) => {
            db.query('SELECT * FROM teams_drills WHERE Team_ID = ? AND Drill_ID = ? AND User_ID = ?', [team_id, drill_id, decoded.id], (err2, results3) => {
              if (err2) {
                reject(err2);
              } else {
                if (results3.length === 0) {
                  db.query('INSERT INTO teams_drills SET ?', { Team_ID: team_id, Drill_ID: drill_id, User_ID: decoded.id }, (err3) => {
                    if (!err3) {
                      resolve();
                    } else {
                      reject(err3);
                    }
                  });
                } else {
                  console.log("Entry already exists in teams_drills table.");
                  resolve();
                }
              }
            });
          });
        });
        try {
          await Promise.all(insertTeamDrillPromises);
          res.redirect('/viewteam/' + team_id);
        } catch (err) {
          console.error(err);
        }
      }

    });

  });
};



exports.uploadFile = async (req, res) => {

  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var { firstNamePlayer, lastNamePlayer, player_upload_email } = req.body;

  console.log(firstNamePlayer, lastNamePlayer, player_upload_email)


  var fileArrayUpload = []

  db.query("SELECT MAX(Players_ID) as pid FROM players where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)
    var new_user_id = 0;
    new_user_id = Number(results[0].pid) + 1;
    console.log(new_user_id)
    if (Array.isArray(firstNamePlayer)) {
      for (var x = 0; x < firstNamePlayer.length; x++) {
        if (firstNamePlayer[x].length === 0) {
          firstNamePlayer[x] = null;
        }
        if (lastNamePlayer[x].length === 0) {
          lastNamePlayer[x] = null;
        }
        if (player_upload_email[x].length === 0) {
          player_upload_email[x] = null;
        }
        var offset = -7;
        var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        var full_name = lastNamePlayer[x] + ' ' + firstNamePlayer[x]
        fileArrayUpload[x] = [new_user_id, full_name, player_upload_email[x], decoded.id, dateTime, firstNamePlayer[x], lastNamePlayer[x]]
        new_user_id += 1;
      }
    }

    else { // only adding one player
      // check for blank inputs then turn them null if so
      if (firstNamePlayer.length === 0) {
        firstNamePlayer = null;
      }
      if (lastNamePlayer.length === 0) {
        lastNamePlayer = null;
      }

      if (player_upload_email.length === 0) {
        player_upload_email = null;
      }
      var offset = -7;
      var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      var full_name = lastNamePlayer + ' ' + firstNamePlayer
      fileArrayUpload[0] = [new_user_id, full_name, player_upload_email, decoded.id, dateTime, firstNamePlayer, lastNamePlayer]

    }

    db.query("INSERT INTO players (Players_ID, P_Name, P_Email, User_ID, Created, First_Name, Last_Name) VALUES ?", [fileArrayUpload], (error, results2) => {
      if (error) console.log(error)
      res.redirect('/players')
    });


  });


};
//const team_id = req.params.teamid;
exports.uploadTeamFile = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const team_id = req.params.teamid;
  var { firstNamePlayer, lastNamePlayer, player_upload_email } = req.body;

  console.log(firstNamePlayer, lastNamePlayer, player_upload_email)

  var fileArrayUpload = []

  db.query("SELECT MAX(Players_ID) as pid FROM players where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)
    var new_play_id = Number(results[0].pid) || 0;
    new_play_id++; // Increment the ID to get the next available ID
    console.log(new_play_id)
    if (Array.isArray(firstNamePlayer)) {
      for (var x = 0; x < firstNamePlayer.length; x++) {
        if (firstNamePlayer[x].length === 0) {
          firstNamePlayer[x] = null;
        }
        if (lastNamePlayer[x].length === 0) {
          lastNamePlayer[x] = null;
        }
        if (player_upload_email[x].length === 0) {
          player_upload_email[x] = null;
        }
        var offset = -7;
        var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        var full_name = lastNamePlayer[x] + ' ' + firstNamePlayer[x]
        fileArrayUpload[x] = [new_play_id, full_name, player_upload_email[x], decoded.id, dateTime, firstNamePlayer[x], lastNamePlayer[x]]
        new_play_id += 1;
      }
    }

    else { // only adding one player
      // check for blank inputs then turn them null if so
      if (firstNamePlayer.length === 0) {
        firstNamePlayer = null;
      }
      if (lastNamePlayer.length === 0) {
        lastNamePlayer = null;
      }

      if (player_upload_email.length === 0) {
        player_upload_email = null;
      }
      var offset = -7;
      var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      var full_name = lastNamePlayer + ' ' + firstNamePlayer
      fileArrayUpload = [[new_play_id, full_name, player_upload_email, decoded.id, dateTime, firstNamePlayer, lastNamePlayer]]
    }

    db.query("INSERT INTO players (Players_ID, P_Name, P_Email, User_ID, Created, First_Name, Last_Name) VALUES ?", [fileArrayUpload], async (error, results2) => {
      if (error) {
        console.log(error);
      } else {
        const insertTeamPlayerPromises = fileArrayUpload.map(([play_id]) => {
          return new Promise((resolve, reject) => {
            db.query('SELECT * FROM teams_players WHERE Team_ID = ? AND Players_ID = ? AND User_ID = ?', [team_id, play_id, decoded.id], (err2, results3) => {
              if (err2) {
                reject(err2);
              } else {
                if (results3.length === 0) {
                  db.query('INSERT INTO teams_players SET ?', { Team_ID: team_id, Players_ID: play_id, User_ID: decoded.id }, (err3) => {
                    if (!err3) {
                      resolve();
                    } else {
                      reject(err3);
                    }
                  });
                } else {
                  console.log("Entry already exists in teams_players table.");
                  resolve();
                }
              }
            });
          });
        });
        try {
          await Promise.all(insertTeamPlayerPromises);
          res.redirect('/viewteam/' + team_id);
        } catch (err) {
          console.error(err);
        }
      }
    });
  });
};




function getUnique(array) {
  var uniqueArray = [];

  // Loop through array values
  for (i = 0; i < array.length; i++) {
    if (uniqueArray.indexOf(array[i]) === -1) {
      uniqueArray.push(array[i]);
    }
  }
  return uniqueArray;
}

exports.deletePlanAjax = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var newBody = JSON.parse(req.body.id);
  if (newBody.length > 0) {
    var bodyInt = []
    console.log("ajax id: ", newBody);
    console.log("ajax length " + newBody.length);
    for (var i = 0; i < newBody.length; i++) {
      if (newBody[i] != undefined) {
        bodyInt.push(parseInt(newBody[i]));
      }
    }


    bodyInt = getUnique(bodyInt)

    console.log("new Ajax int", bodyInt)

    db.query('DELETE FROM plans WHERE Plan_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], (err, rows) => {
      if (err) console.log(err);
      db.query('DELETE FROM teams_plans WHERE Plan_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], (err2, rows) => {
        if (err2) console.log(err2)
        console.log("deleted")
        ///res.redirect('/players');
      });



    });
  }

  //res.redirect('/plans')
}

exports.deleteTeamPlanAjax = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var newBody = JSON.parse(req.body.id);
  if (newBody.length > 0) {
    var bodyInt = []
    console.log("ajax id: ", newBody);
    console.log("ajax length " + newBody.length);
    for (var i = 0; i < newBody.length; i++) {
      if (newBody[i] != undefined) {
        bodyInt.push(parseInt(newBody[i]));
      }
    }


    bodyInt = getUnique(bodyInt)

    console.log("new Ajax int", bodyInt)

    db.query('DELETE FROM teams_plans WHERE Plan_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], (err2, rows) => {
      if (err2) console.log(err2)
      console.log("deleted")
      ///res.redirect('/players');
    });




  }

  //res.redirect('/plans')
}


exports.deletePlayerAjax = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var newBody = JSON.parse(req.body.id);
  if (newBody.length > 0) {
    var bodyInt = []
    for (var i = 0; i < newBody.length; i++) {
      if (newBody[i] != undefined) {
        bodyInt.push(parseInt(newBody[i]));
      }
    }

    bodyInt = getUnique(bodyInt)

    console.log("new players int after ", bodyInt)

    db.query('DELETE FROM players WHERE Players_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], (err, rows) => {
      if (err) console.log(err);
      db.query('DELETE FROM teams_players WHERE Players_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], (err2, rows) => {
        if (err2) console.log(err2)
        console.log("deleted")
        ///res.redirect('/players');
      });



    });
  }



}

exports.deleteTeamPlayerAjax = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var newBody = JSON.parse(req.body.id);

  if (newBody.length > 0) {
    var bodyInt = []
    for (var i = 0; i < newBody.length; i++) {
      if (newBody[i] != undefined) {
        bodyInt.push(parseInt(newBody[i]));
      }
    }

    bodyInt = getUnique(bodyInt)

    console.log("new players int after ", bodyInt)

    // Retrieve the team IDs of the players being deleted
    db.query('SELECT DISTINCT Team_ID FROM teams_players WHERE Players_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], async (err1, teamRows) => {
      if (err1) console.log(err1);

      const teamIds = teamRows.map(row => row.Team_ID);

      // Delete the players from the teams_players table
      db.query('DELETE FROM teams_players WHERE Players_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], async (err2, rows) => {
        if (err2) console.log(err2);
        console.log("deleted");

        res.status(200).send({ success: true });
      });
    });
  }
}

exports.viewPlayer = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var playerid = Number(req.params.playerid)
  var listOfTeamArray = []
  db.query('SELECT * FROM teams WHERE User_ID = ?', [decoded.id], (teamListError, listOfTeam) => {
    if (teamListError) {
      console.log(teamListError);
    }
    else if (listOfTeam.length != 0) {
      for (var x = 0; x < listOfTeam.length; x++) {
        listOfTeamArray[x] = { Team_ID: listOfTeam[x].Team_ID, Team_Name: listOfTeam[x].Team_Name, Created: listOfTeam[x].Created }
      }
    }
    else {
      listOfTeamArray[0] = { Team_ID: '', Team_Name: 'Empty', Created: '' }
    }

  });

  db.query('SELECT * FROM players WHERE Players_ID = ? AND User_ID = ?', [playerid, decoded.id], (err, rows) => {
    if (err) console.log(err)
    db.query('SELECT Team_ID FROM teams_players WHERE Players_ID = ? AND User_ID = ?', [playerid, decoded.id], (err2, rows2) => {
      if (err2) console.log(err2)
      else if (rows2.length != 0) {
        db.query('SELECT Team_Name FROM teams WHERE Team_ID = ? AND User_ID = ?', [rows2[0].Team_ID, decoded.id], (err3, rows3) => {
          if (err3) console.log(err3)
          var playerInfo = Object.values(JSON.parse(JSON.stringify(rows)))
          var pid = playerInfo[0].Players_ID
          var player_name = playerInfo[0].P_Name;
          var player_email = playerInfo[0].P_Email;
          var player_f_name = playerInfo[0].First_Name;
          var player_l_name = playerInfo[0].Last_Name;
          var teamName = rows3[0].Team_Name;

          res.render('viewPlayer', { pid, player_name, player_email, player_f_name, player_l_name, teamName, listOfTeamArray });
        });
      }

      else {

        var playerInfo = Object.values(JSON.parse(JSON.stringify(rows)))
        var pid = playerInfo[0].Players_ID
        var player_name = playerInfo[0].P_Name;
        var player_email = playerInfo[0].P_Email;
        var player_f_name = playerInfo[0].First_Name;
        var player_l_name = playerInfo[0].Last_Name;
        var teamName = "Unassigned"

        res.render('viewPlayer', { pid, player_name, player_email, player_f_name, player_l_name, teamName, listOfTeamArray });
      }


    });
  });
};




exports.viewTeamPlayer = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const team_id = Number(req.params.teamid);
  const player_id = Number(req.params.playerid);

  console.log('Team ID:', team_id);
  console.log('Player ID:', player_id);
  console.log('User ID:', decoded.id);

  db.query('SELECT * FROM teams_players WHERE Team_ID = ? AND Players_ID = ? AND User_ID = ?', [team_id, player_id, decoded.id], (err, rows) => {
    if (err) {
      console.log(err);
    } else if (rows.length === 0) {
      res.send('Player is not a member of this team');
    } else {
      const player_info = Object.values(JSON.parse(JSON.stringify(rows)));
      const pid = player_info[0].Players_ID;

      db.query('SELECT * FROM players WHERE Players_ID = ? AND User_ID = ?', [pid, decoded.id], (err, rows) => {
        if (err) {
          console.log(err);
        } else if (rows.length === 0) {
          res.send('Player not found');
        } else {
          const player_data = Object.values(JSON.parse(JSON.stringify(rows)));
          const player_name = player_data[0].P_Name;
          const player_email = player_data[0].P_Email;

          console.log('Player Name:', player_name);
          console.log('Player Email:', player_email);

          res.render('viewPlayer', { pid, player_name, player_email, team_id });
        }
      });
    }
  });
};

exports.viewTeamPlan = async (req, res) => {
  try {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    const team_id = Number(req.params.teamid);
    const plan_id = Number(req.params.planid);

    db.query('SELECT * FROM teams_plans WHERE Team_ID = ? AND Plan_ID = ? AND User_ID = ?', [team_id, plan_id, decoded.id], (err, rows) => {
      if (err) {
        console.log(err);
        res.send('Team plan not found');
      } else if (rows.length === 0) {
        res.send('Team plan not found');
      } else {
        db.query('SELECT * FROM plans WHERE Plan_ID = ? AND User_ID = ?', [plan_id, decoded.id], (err, rows) => {
          if (err) {
            console.log(err);
            res.send('Plan not found');
          } else if (rows.length === 0) {
            res.send('Plan not found');
          } else {
            const plan_info = Object.values(JSON.parse(JSON.stringify(rows)));
            const plan_name = plan_info[0].Name;
            const plan_date = plan_info[0].Created;
            const plan_arr = JSON.parse(plan_info[0].Plan);

            const objectsA = [];
            for (let i = 0; i < plan_arr.start_times.length; i++) {
              const start_hours = parseInt(plan_arr.start_times[i].split(':')[0]);
              const start_minutes = parseInt(plan_arr.start_times[i].split(':')[1]);
              const AmOrPmStart = start_hours >= 12 ? 'pm' : 'am';
              const finalStartTime = ((start_hours + 11) % 12 + 1) + ':' + start_minutes + AmOrPmStart;

              const end_hours = parseInt(plan_arr.end_times[i].split(':')[0]);
              const end_minutes = parseInt(plan_arr.end_times[i].split(':')[1]);
              const AmOrPmEnd = end_hours >= 12 ? 'pm' : 'am';
              const finalEndTime = ((end_hours + 11) % 12 + 1) + ':' + end_minutes + AmOrPmEnd;

              objectsA.push({
                player_name: plan_arr.player_name[i],
                drill_name: plan_arr.drill_name[i],
                drill_type: plan_arr.drill_type[i],
                drill_category: plan_arr.drill_category[i],
                startTime: finalStartTime,
                endTime: finalEndTime,
                notes_comments: plan_arr.notes[i],
                pic_link: plan_arr.pics[i],
                duration: plan_arr.drill_duration[i],
              });
            }

            res.render('view-plan', {
              team_id: team_id,
              plan_id: plan_id,
              plan_name: plan_name,
              plan_date: plan_date,
              objectsA: objectsA,
            });
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send('An error occurred');
  }
};




exports.addNewPlayer = async (req, res) => {
  var new_user_id;
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { f_name, l_name, player_email } = req.body;

  //var datetime = new Date().toLocaleString();
  var offset = -7;
  var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  var player_fullName = l_name + " " + f_name;

  db.query("SELECT MAX(Players_ID) as pid FROM players where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)

    new_user_id = Number(results[0].pid) + 1;
    console.log(new_user_id)
    db.query('INSERT INTO players SET ?', { Players_ID: new_user_id, P_Name: player_fullName, P_Email: player_email, First_Name: f_name, Last_Name: l_name, Created: dateTime, User_ID: decoded.id }, (err, rows) => {
      if (err) console.log(err);

      //Take user back to players list
      res.redirect('/players/');
    });
  });
}

exports.addNewPlayerHome = async (req, res) => {
  var new_player_id;
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { f_name, l_name, player_email } = req.body;
  const team_id = req.params.tid;
  // console.log("THE ID:");
  // console.log(team_id);
  var datetime = new Date().toLocaleString();
  console.log("date when added: ", datetime);
  var player_fullName = l_name + " " + f_name;

  db.query("SELECT MAX(Players_ID) as pid FROM players where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)

    new_player_id = Number(results[0].pid) + 1;
    console.log(new_player_id)
    db.query('INSERT INTO players SET ?', { Players_ID: new_player_id, P_Name: player_fullName, P_Email: player_email, First_Name: f_name, Last_Name: l_name, User_ID: decoded.id }, (err, rows) => {
      if (err) {
        console.log(err);
      }
      db.query('INSERT INTO teams_players SET ?', { Team_ID: team_id, Players_ID: new_player_id, User_ID: decoded.id }, (err2) => {
        if (!err2) {
          res.redirect('/HomePage/' + team_id);
        }
        else {
          console.log(err2);
        }
      })

      //Take user back to players list

    });
  });
}

exports.addNewTeamPlayer = async (req, res) => {
  var new_play_id;
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

  const team_id = req.params.teamid;
  const { f_name, l_name, player_email } = req.body;
  console.log("THE ID:");
  console.log(team_id);
  var offset = -7;
  var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  var player_fullName = l_name + " " + f_name;

  db.query("SELECT MAX(Players_ID) as pid FROM players where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)

    new_play_id = Number(results[0].pid) + 1;
    console.log(new_play_id)
    db.query('INSERT INTO players SET ?', { Players_ID: new_play_id, P_Name: player_fullName, P_Email: player_email, First_Name: f_name, Last_Name: l_name, Created: dateTime, User_ID: decoded.id }, (err, rows) => {
      if (err) {
        console.log(err);
      }
      db.query('INSERT INTO teams_players SET ?', { Team_ID: team_id, Players_ID: new_play_id, User_ID: decoded.id }, (err2) => {
        if (!err2) {
          res.redirect(`/viewteam/` + team_id);
        }
        else {
          console.log(err2);
        }
      })



    });
  });
}


exports.updatePlayer = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { p_email, p_id, f_name, l_name, teamOption } = req.body;
  var player_fullName = l_name + " " + f_name;
  var teamStatus;
  var teamOpt;
  if (teamOption >= 1) {
    console.log("team optio: ", teamOption)
    teamOpt = teamOption;
  }
  //console.log("team optio: ", teamOption)

  db.query('SELECT Team_ID from teams_players WHERE exists (SELECT * from teams_players WHERE Players_ID = ? AND User_ID = ?) AND Players_ID = ? AND User_ID = ?;', [p_id, decoded.id, p_id, decoded.id], (err2, rows2) => {
    if (err2) {
      console.log(err2)
    }
    else if (rows2.length >= 1) {
      teamStatus = true;
      console.log("exists", rows2.length)

    }
    else {
      console.log("doesn't exist", rows2.length)
      teamStatus = false;
    }
  });
  db.query('UPDATE players SET P_Name = ?, P_Email = ?, First_Name=?, Last_Name=? WHERE Players_ID = ? AND User_ID = ? ;', [player_fullName, p_email, f_name, l_name, p_id, decoded.id], (err, rows) => {
    if (err) console.log(err);

    else if (teamStatus == true) {
      db.query('UPDATE teams_players SET Team_ID = ? WHERE Players_ID = ? AND User_ID = ? ;', [teamOpt, p_id, decoded.id], (err3, rows3) => {

      });
    }
    else {
      db.query('INSERT INTO teams_players SET ?', { Team_ID: teamOpt, Players_ID: p_id, User_ID: decoded.id }, (err, rows) => {

      });

    }
    //Take user back to players list
    res.redirect('/players');
  });
}

exports.editProfilePlayer = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { p_email, p_id, f_name, l_name, teamOption } = req.body;
  var player_fullName = l_name + " " + f_name;
  var teamStatus;
  var teamOpt;
  if (teamOption >= 1) {
    console.log("team optio: ", teamOption)
    teamOpt = teamOption;
  }
  //console.log("team optio: ", teamOption)

  db.query('SELECT Team_ID from teams_players WHERE exists (SELECT * from teams_players WHERE Players_ID = ? AND User_ID = ?) AND Players_ID = ? AND User_ID = ?;', [p_id, decoded.id, p_id, decoded.id], (err2, rows2) => {
    if (err2) {
      console.log(err2)
    }
    else if (rows2.length >= 1) {
      teamStatus = true;
      console.log("exists", rows2.length)

    }
    else {
      console.log("doesn't exist", rows2.length)
      teamStatus = false;
    }
  });
  db.query('UPDATE players SET P_Name = ?, P_Email = ?, First_Name=?, Last_Name=? WHERE Players_ID = ? AND User_ID = ? ;', [player_fullName, p_email, f_name, l_name, p_id, decoded.id], (err, rows) => {
    if (err) console.log(err);

    else if (teamStatus == true) {
      db.query('UPDATE teams_players SET Team_ID = ? WHERE Players_ID = ? AND User_ID = ? ;', [teamOpt, p_id, decoded.id], (err3, rows3) => {

      });
    }
    else {
      db.query('INSERT INTO teams_players SET ?', { Team_ID: teamOpt, Players_ID: p_id, User_ID: decoded.id }, (err, rows) => {

      });

    }
    //Take user back to players list
    res.redirect('viewPlayer/' + p_id);
  });
}

exports.updateTeamName = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { team_name, t_id } = req.body;


  db.query('UPDATE teams SET Team_Name = ? WHERE Team_ID = ? AND User_ID = ? ;', [team_name, t_id, decoded.id], (err, rows) => {
    if (err) console.log(err);

    //Take user back to players list
    res.redirect('/select-team');
  });
}


exports.edTeamPlayer = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { p_email, p_id, f_name, l_name } = req.body;
  const team_id = req.params.teamid;
  const player_id = req.params.playerid;
  var player_fullName = l_name + " " + f_name;
  db.query('SELECT * FROM teams_players WHERE  Players_ID = ? AND User_ID = ?', [player_id, decoded.id], (err, rows) => {
    if (err) {
      console.log(err);
    } else if (rows.length === 0) {
      res.send('Player is not a member of this team');
    } else {
      db.query('UPDATE players SET P_Name = ?, P_Email = ?, First_Name=?, Last_Name=? WHERE Players_ID = ? AND User_ID = ? ;', [player_fullName, p_email, f_name, l_name, p_id, decoded.id], (err2, rows) => {
        if (err2) console.log(err2);

        //Take user back to players list
        res.redirect('/viewteam/' + team_id);
      });
    }
  });
}


exports.addNewDrillHome = async (req, res) => {
  var new_drill_id;
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { drill_name, drill_category, drill_type, drill_description, drill_link } = req.body;
  const team_id = req.params.tid;

  db.query("SELECT MAX(Drill_ID) as dr_id FROM drills where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)
    if (results.length != 0) {
      new_drill_id = Number(results[0].dr_id) + 1;
    }

    db.query('INSERT INTO drills SET ?', { Drill_ID: new_drill_id, Dr_Name: drill_name, Dr_Category: drill_category, Dr_Type: drill_type, Description: drill_description, Url: drill_link, User_ID: decoded.id }, (err, rows) => {
      if (err) {
        console.log(err);
      }
      else {
        db.query('INSERT INTO teams_drills SET ?', { Team_ID: team_id, Drill_ID: new_drill_id, User_ID: decoded.id }, (err2) => {
          if (!err2) {
            res.redirect('/HomePage/' + team_id);
          }
          else {
            console.log(err2);
          }
        })
      }
    });
  })
}

exports.addNewDrill = async (req, res) => {
  var new_drill_id;
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { drill_name, drill_category, drill_type, drill_description, drill_link } = req.body;

  db.query("SELECT MAX(Drill_ID) as dr_id FROM drills where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)
    if (results.length != 0) {
      new_drill_id = Number(results[0].dr_id) + 1;
    }

    db.query('INSERT INTO drills SET ?', { Drill_ID: new_drill_id, Dr_Name: drill_name, Dr_Category: drill_category, Dr_Type: drill_type, Description: drill_description, Url: drill_link, User_ID: decoded.id }, (err, rows) => {
      if (err) console.log(err);
      res.redirect('/drills');
    });
  })
}



exports.addTeamDrill = async (req, res) => {
  var new_drillT_id;
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { drill_name, drill_category, drill_type, drill_description, drill_link } = req.body;
  const team_id = req.params.teamid;

  db.query("SELECT MAX(Drill_ID) as dr_id FROM drills where User_ID = ?", [decoded.id], (err1, results) => {
    if (err1) console.log(err1)
    if (results.length != 0) {
      new_drillT_id = Number(results[0].dr_id) + 1;
    }

    db.query('INSERT INTO drills SET ?', { Drill_ID: new_drillT_id, Dr_Name: drill_name, Dr_Category: drill_category, Dr_Type: drill_type, Description: drill_description, Url: drill_link, User_ID: decoded.id }, (err, rows) => {
      if (err) {
        console.log(err);
      }
      else {
        db.query('INSERT INTO teams_drills SET ?', { Team_ID: team_id, Drill_ID: new_drillT_id, User_ID: decoded.id }, (err2) => {
          if (!err2) {
            res.redirect('/viewteam/' + team_id);
          }
          else {
            console.log(err2);
          }
        })
      }
    });
  })
}


exports.updateDrill = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  console.log(req.body)
  const { drill_name, drill_category, drill_type, drill_description, drill_id, drill_link } = req.body;

  db.query('UPDATE drills SET Dr_Name = ?, Dr_Category = ?, Dr_Type= ?,  Description= ?, Url=? WHERE Drill_ID = ? AND User_ID = ?', [drill_name, drill_category, drill_type, drill_description, drill_link, drill_id, decoded.id], (err, rows) => {
    if (!err) console.log(err);

    res.redirect('/drills');
  });
}

exports.editDrillTeam = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const { drill_name, drill_category, drill_type, drill_description, drill_id, drill_link } = req.body;
  const team_id = req.params.teamid;
  const dr_id = req.params.drillid;
  db.query('SELECT * FROM teams_drills WHERE Drill_ID = ? AND User_ID = ?', [dr_id, decoded.id], (err, rows) => {
    if (err) {
      console.log(err);
    } else if (rows.length === 0) {
      res.send('Drill is not a member of this team');
    } else {
      db.query('UPDATE drills SET Dr_Name = ?, Dr_Category = ?, Dr_Type= ?,  Description= ?, Url=? WHERE Drill_ID = ? AND User_ID = ?', [drill_name, drill_category, drill_type, drill_description, drill_link, drill_id, decoded.id], (err2, rows) => {
        if (err2) console.log(err2);

        //Take user back to players list
        res.redirect('/viewteam/' + team_id);
      });
    }
  });
}



exports.deleteDrillAjax = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var newBody = JSON.parse(req.body.id);
  if (newBody.length > 0) {
    var bodyInt = []
    console.log("ajax id: ", newBody);
    console.log("ajax length " + newBody.length);
    for (var i = 0; i < newBody.length; i++) {
      if (newBody[i] != undefined) {
        bodyInt.push(parseInt(newBody[i]));
      }
    }



    bodyInt = getUnique(bodyInt)

    console.log("new Ajax int after ", bodyInt)

    db.query('DELETE FROM teams_drills WHERE Drill_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], (err, rows) => {
      if (err) console.log(err);
      db.query('DELETE FROM drills WHERE Drill_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], (err2, rows) => {
        if (err2) console.log(err2)
        console.log("deleted")
        //res.redirect('/drills');
      });
    });
  }



}

exports.deleteTeamDrillAjax = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var newBody = JSON.parse(req.body.id);
  if (newBody.length > 0) {
    var bodyInt = []
    console.log("ajax id: ", newBody);
    console.log("ajax length " + newBody.length);
    for (var i = 0; i < newBody.length; i++) {
      if (newBody[i] != undefined) {
        bodyInt.push(parseInt(newBody[i]));
      }
    }



    bodyInt = getUnique(bodyInt)

    console.log("new Ajax int after ", bodyInt)


    db.query('DELETE FROM drills WHERE Drill_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id], (err2, rows) => {
      if (err2) console.log(err2)
      console.log("deleted")
      //res.redirect('/drills');
    });

  }



}

exports.deleteTeamAjax = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var newBody = JSON.parse(req.body.id);
  if (newBody.length > 0) {
    var bodyInt = [];
    for (var i = 0; i < newBody.length; i++) {
      if (newBody[i] != undefined) {
        bodyInt.push(parseInt(newBody[i]));
      }
    }

    bodyInt = getUnique(bodyInt);

    db.beginTransaction(async (err) => {
      if (err) console.log(err);
      try {
        await db.query('DELETE FROM teams_drills WHERE Team_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id]);
        await db.query('DELETE FROM teams_plans WHERE Team_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id]);
        await db.query('DELETE FROM teams_players WHERE Team_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id]);
        await db.query('DELETE FROM teams WHERE Team_ID IN (?) AND User_ID = ?', [bodyInt, decoded.id]);
        
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.log(err);
            });
          }
          res.redirect('/select-team');
        });
      } catch (error) {
        return db.rollback(() => {
          console.log(error);
        });
      }
    });
  }
};

exports.deleteDrill = async (req, res) => {

  var dr_id = req.params.drillid
  var teamid = req.params.teamid
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

  db.query('DELETE FROM drills WHERE Drill_ID = ? AND Team_ID = ? AND User_ID = ?', [dr_id, teamid, decoded.id], (err, rows) => {
    if (!err) {

      res.redirect('/view-drills/' + teamid);

    } else {
      console.log(err);
    }

  });
}

exports.deletePlayer = async (req, res) => {
  try {
    const playerid = req.body.player_id
    const teamid = req.params.teamid;
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    db.query('DELETE FROM team_players WHERE Players_ID = ? AND Team_ID = ? AND User_ID = ?', [playerid, teamid, decoded.id]);
    db.query('DELETE FROM players WHERE Players_ID = ? AND User_ID = ?', [playerid, decoded.id]);

    res.redirect('/viewteam/' + teamid);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
};



exports.changeTeam = (req, res) => {
  const team_names = Object.keys(JSON.parse(JSON.stringify(req.body)))
  const team_name = team_names[0]

  db.query("SELECT Team_ID from teams WHERE Team_Name = ?", [team_name], (err, team_id) => {
    if (!err) {
      var result = Object.values(JSON.parse(JSON.stringify(team_id)))
      var team_id = result[0].Team_ID
    }
    else {
      console.log(err)
    }
  })

}

exports.addPlan = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

  var planTitles = req.body.planTitle
  var start_time = req.body.starttime
  var end_time = req.body.endtime
  var drillTypes = req.body.drillType
  var drillCategories = req.body.drillCat
  var notes = req.body.notes
  var drillName = req.body.drillSelect
  var positions_players = req.body.positionPlayers
  var team_id = Number(req.body.chooseTeamHidden) // CANNOT BE NULL, USED FOR QUERIES BELOW
  var pic_links = req.body.drawLinkHidden
  var plan_date = req.body.planDate
  var plan_start_time = req.body.planStartTime
  var drill_duration = req.body.drillDuration
  var stats1 = req.body.stats_drill_1
  var stats2 = req.body.stats_drill_2
  var stats3 = req.body.stats_drill_3
  var stats4 = req.body.stats_drill_4

  console.log(positions_players)

  

  let plan_details = {
    plan_title: planTitles,
    start_times: start_time,
    end_times: end_time,
    drill_type: drillTypes,
    drill_category: drillCategories,
    notes: notes,
    drill_name: drillName,
    pics: pic_links,
    players_positions: positions_players,
    plan_date: plan_date,
    plan_start_time: plan_start_time,
    drill_duration: drill_duration,
    stats1: stats1,
    stats2: stats2,
    stats3: stats3,
    stats4: stats4
  }

  //console.log(plan_details)

  var plan_to_json = JSON.stringify(plan_details);

  console.log(plan_to_json)


  db.query("SELECT MAX(Plan_ID) as max_plan_id FROM plans WHERE User_ID = ?", [decoded.id], (err, plan_id) => {
    if (!err) {
      var pid = Number(plan_id[0].max_plan_id) + 1

      db.query('INSERT INTO plans SET ?', { Plan_ID: pid, Name: planTitles, Created: plan_date, User_ID: decoded.id, Plan: plan_to_json }, (err2, rows) => {
        if (!err2) {
          console.log(rows)
        }
        else {
          console.log(err2);
        }
      });
      db.query('INSERT INTO teams_plans SET Plan_ID = ?, Team_ID = ?, User_ID = ?', [pid, team_id, decoded.id], (err3, result) => {
        if (!err3) {
          console.log(result)
          res.redirect('/plans')
          //res.redirect(`/view-plan/${pid}`);
        }
        else {
          console.log(err3)
        }
      })

    }
    else {
      console.log(err);
    }
  });


}

exports.updatePlan = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

  var plan_id_update = req.body.planid

  var planTitles = req.body.planTitle
  var start_time = req.body.starttime
  var end_time = req.body.endtime
  var drillTypes = req.body.drillType
  var drillCategories = req.body.drillCat
  var notes = req.body.notes
  var drillName = req.body.drillSelect
  var positions_players = req.body.positionPlayersSubmit
  var team_id = Number(req.body.chooseTeamHidden) // CANNOT BE NULL, USED FOR QUERIES BELOW
  var pic_links = req.body.drawLinkHidden
  var plan_date = req.body.planDate
  var plan_start_time = req.body.planStartTime
  var drill_duration = req.body.drillDuration
  var stats1 = req.body.stats_drill_1
  var stats2 = req.body.stats_drill_2
  var stats3 = req.body.stats_drill_3
  var stats4 = req.body.stats_drill_4

  console.log(positions_players)

  

  let plan_details = {
    plan_title: planTitles,
    start_times: start_time,
    end_times: end_time,
    drill_type: drillTypes,
    drill_category: drillCategories,
    notes: notes,
    drill_name: drillName,
    pics: pic_links,
    players_positions: positions_players,
    plan_date: plan_date,
    plan_start_time: plan_start_time,
    drill_duration: drill_duration,
    stats1: stats1,
    stats2: stats2,
    stats3: stats3,
    stats4: stats4
  }

  console.log(plan_details)

  var plan_to_json = JSON.stringify(plan_details);

  console.log("plan_id", plan_id_update)

  db.query('DELETE FROM plans WHERE Plan_ID = ? AND User_ID = ?', [plan_id_update, decoded.id], (delete_err, delete_result) => {
    if (!delete_err) {
      console.log(delete_result)

      db.query('INSERT INTO plans SET Name = ?, Created = ?, Plan = ?, Plan_ID = ?, User_ID = ?', [planTitles, plan_date, plan_to_json, plan_id_update, decoded.id], (err2, rows) => {
        if (!err2) {
          console.log(rows)
          console.log('here')
          res.redirect('/plans')
        }
        else {
          console.log(err2);
        }
      });

    }
    else {
      console.log(delete_err)
    }
  })






}

exports.updateTeamPlan = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const plan_id = req.params.planid;
  const teamid = req.body.team_id;
  console.log('team_id:', team_id);
  var plan_id_update = req.body.planid;

  var planTitles = req.body.planTitle
  var start_time = req.body.starttime
  var end_time = req.body.endtime
  var drillTypes = req.body.drillType
  var drillCategories = req.body.drillCategory
  var notes = req.body.notes
  var drillName = req.body.drillSelect
  var players = req.body.inputPlayer
  var team_id = Number(req.body.chooseTeamHidden)
  var pic_links = req.body.drawLinkHidden
  var plan_date = req.body.planDate
  var plan_start_time = req.body.planStartTime
  var drill_duration = req.body.drillDuration
  var stats1 = req.body.stats_drill_1
  var stats2 = req.body.stats_drill_2
  var stats3 = req.body.stats_drill_3
  var stats4 = req.body.stats_drill_4
  console.log('Request body:', req.body);
  console.log(stats1, stats2, stats3, stats4)


  let plan_details = {
    plan_title: planTitles,
    start_times: start_time,
    end_times: end_time,
    drill_type: drillTypes,
    drill_category: drillCategories,
    notes: notes,
    drill_name: drillName,
    pics: pic_links,
    player_name: players,
    plan_date: plan_date,
    plan_start_time: plan_start_time,
    drill_duration: drill_duration,
    stats1: stats1,
    stats2: stats2,
    stats3: stats3,
    stats4: stats4
  }

  //console.log(plan_details)

  var plan_to_json = JSON.stringify(plan_details);

  console.log("plan_id", plan_id_update)

  db.query('DELETE FROM plans WHERE Plan_ID = ? AND User_ID = ?', [plan_id_update, decoded.id], (delete_err, delete_result) => {
    if (!delete_err) {
      console.log(delete_result)

      db.query('INSERT INTO plans SET Name = ?, Created = ?, Plan = ?, Plan_ID = ?, User_ID = ?', [planTitles, plan_date, plan_to_json, plan_id_update, decoded.id], (err1, rows) => {
        if (err1) {
          console.log(err1)
        }
        db.query('INSERT INTO teams_plans SET Plan_ID = ?, Team_ID = ?, AND User_ID = ?', [plan_id, team_id, decoded.id], (err2, rows) => {
          if (!err2) {
            console.log(rows)
            console.log('tanveer')
            console.log('teamid', teamid);
            res.redirect('/viewteam/' + teamid)
          }
          else {
            console.log(err2);
          }
        });

      })

    }
    else {
      console.log(delete_err)
    }
  })

}


exports.editTeamPlan = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  const team_id = req.params.teamid;
  const plan_id = req.params.planid;

  db.query('SELECT * FROM teams_plans WHERE Team_ID = ? AND Plan_ID = ? AND User_ID = ?', [team_id, plan_id, decoded.id], async (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred while fetching team data.');
      return;
    }
    if (rows.length === 0) {
      res.status(404).send('Team plan not found.');
      return;
    }

    db.query('SELECT * FROM plans WHERE Plan_ID = ? AND User_ID = ?', [plan_id, decoded.id], async (err1, rows1) => {
      if (err1) {
        console.log(err);
        res.status(500).send('An error occurred while fetching plan data.');
        return;
      }
      if (rows1.length === 0) {
        res.status(404).send('Plan not found.');
        return;
      }

      // QUERIES FOR FILLING IN INPUT FIELDS WITH SAVED PLAN INFORMATION
      db.query('SELECT Plan, Name, Created FROM plans WHERE Plan_ID = ? AND User_ID = ?', [plan_id, decoded.id], (err, rows) => {
        if (!err) {
          var planArr = rows
          var planName = planArr[0].Name;
          var plandate = planArr[0].Created

          plandate = Object.values(JSON.parse(JSON.stringify(plandate)))
          plandate = plandate.slice(0, 10)
          plandate = ''.concat(plandate).replaceAll(',', "")

          var arr2 = planArr[0].Plan;
          var newArr = JSON.parse(arr2);

          var planstarttime = newArr.plan_start_time

          var objectsA = []
          var num_rows = 0
          if (Array.isArray(newArr.start_times)) {
            num_rows = newArr.start_times.length
            for (var i = 0; i < newArr.start_times.length; i++) {
              objectsA[i] = {
                player_name: newArr.player_name[i], drill_name: newArr.drill_name[i], drill_type: newArr.drill_type[i],
                drill_category: newArr.drill_category[i], startTime: newArr.start_times[i], endTime: newArr.end_times[i],
                notes_comments: newArr.notes[i], pic_link: newArr.pics[i], duration: newArr.drill_duration[i]
              };
            }
          } else {
            num_rows = 1
            objectsA[0] = {
              player_name: newArr.player_name, drill_name: newArr.drill_name, drill_type: newArr.drill_type,
              drill_category: newArr.drill_category, startTime: newArr.start_times, endTime: newArr.end_times,
              notes_comments: newArr.notes, pic_link: newArr.pics, duration: newArr.drill_duration
            };
          }

          res.render('edit-plan', {
            title: 'Edit Plan',
            team_id: team_id,
            plan_id: plan_id,

            planName: planName,
            plandate: plandate,
            planstarttime: planstarttime,
            num_rows: num_rows,
            planData: objectsA
          });
        } else {
          console.log(err);
          res.status(500).send
        }
      });
    });
  });
}

exports.deleteTeam = async (req, res) => {

  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

  db.query('DELETE FROM players WHERE Team_ID = ? AND User_ID = ?', [req.params.id, decoded.id], (error2, results2) => {
    if (!error2) {
      db.query('DELETE FROM drills WHERE Team_ID = ? AND User_ID = ?', [req.params.id, decoded.id], (error3, results3) => {
        if (!error3) {
          db.query('DELETE FROM teams WHERE Team_ID = ? AND User_ID = ?', [req.params.id, decoded.id], (error4, results4) => {
            if (!error4) {
              res.redirect('/select-team');
            }
            else {
              console.log(error4)
            }
          })
        }
        else {
          console.log(error3)
        }
      })
    }
    else {
      console.log(error2)
    }
  })
}


exports.addTeam = async (req, res) => {

  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var uid = decoded.id
  // console.log(req);
  // console.log("req^");
  console.log("Team controllers")
  const pQuery = "INSERT INTO players (Players_ID, P_Name, P_Email, User_ID, First_Name, Last_Name, Created) VALUES ?";
  const drQuery = "INSERT INTO drills (Drill_ID, Dr_Name, Dr_Category, Dr_Type, User_ID, Created, Description, Url) VALUES ?";

  var offset = -7;
  var dateTime = new Date(new Date().getTime() + offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');

  var fName = req.body.firstName;
  var lName = req.body.lastName;
  var pEmail = req.body.playerEmail;
  var drName = req.body.drillName;
  var drCategory = req.body.category;
  var drType = req.body.type;
  var teamNm = req.body.teamName;
  var drDescription = req.body.Description;
  var drLink = req.body.Link;
  var fromDb = undefined;
  var new_team_id;
  var pName = [];

  // console.log("fName:");
  // console.log(fName);

  teamNm = teamNm.trim()

  db.query('SELECT MAX(Team_ID) as tid from teams WHERE User_ID = ?', [uid], (error, results) => {
    if (error) {
      console.log(error);
    }
    else {
      // console.log(results)
      // console.log("res0")
      // console.log(results[0])
      new_team_id = results[0].tid + 1;
      db.query('SELECT MAX(Players_ID) as pid from players WHERE User_ID = ?', [decoded.id], (error2, results2) => {
        if (!error2) {

          var newP = [];
          var teamP = [];
          var new_player_id = results2[0].pid + 1;
          var playernum = new_player_id;
          // console.log("playernum");
          // console.log(pName);

          // if more than one player added in create team
          if (Array.isArray(fName)) {
            for (let i = 0; i < fName.length; i++) {
              console.log("fName " + i + ": " + fName[i] + "  lName " + i + ": " + lName[i] + "  pEmail " + i + ": " + pEmail[i])


              if (pEmail[i].length === 0) {
                pEmail[i] = null;
              }
              // if (fName[i].length === 0) {
              //   fName[i] = null;
              // }
              // if (lName[i].length === 0) {
              //   lName[i] = null;
              // }
              if (fName[i].length === 0 && lName[i].length === 0) {
                pName[i] = null;
                fName[i] = null;
                lName[i] = null;
              }
              else if (fName[i].length === 0 && lName[i].length != 0) {
                pName[i] = lName[i];
                fName = null;
              }
              else if (fName[i].length != 0 && lName[i].length === 0) {
                pName[i] = fName[i];
                lName = null;
              }
              else {
                pName[i] = fName[i] + " " + lName[i];
              }

              new_player_id = playernum;
              teamP[i] = [new_team_id, new_player_id, uid]
              newP[i] = [new_player_id, pName[i], pEmail[i], decoded.id, fName[i], lName[i], dateTime];
              playernum = playernum + 1;


            }

            db.query(pQuery, [newP], (error, results) => {
              if (error) {
                console.log(error);
              } else {
                //console.log(results);
              }
            });

            db.query("INSERT INTO teams_players(Team_ID, Players_ID, User_ID) VALUES ?", [teamP], (err, res1) => {
              if (err) {
                console.log(err)
              }
              else { }
            });
            // console.log("the full names?:");
            // console.log(pName);
          }


          else { // only adding one player
            // check for blank inputs then turn them null if so
            // if (fName.length === 0) {
            //   fName = null;
            // }

            // if (lName.length === 0) {
            //   lName = null;
            // }
            console.log("fName: " + fName + "  lName: " + lName + "  pEmail: " + pEmail)
            if (pEmail.length === 0) {
              pEmail = null;
            }
            if (fName.length === 0 && lName.length === 0) {
              pName = null;
              fName = null;
              lName = null;
              console.log("both empty")
            }
            else if (fName.length === 0 && lName.length != 0) {
              pName = lName;
              fName = null;
              console.log("first empty")
            }
            else if (fName.length != 0 && lName.length === 0) {
              pName = fName;
              lName = null;
              console.log("last empty")
            }
            else {
              console.log("neither empty")
              pName = fName + " " + lName;
            }

            if ((pEmail === null) && (pName === null)) {
              console.log("Empty Row. Didn't append player")
            }
            else {
              teamP[0] = [new_team_id, new_player_id, uid]
              newP[0] = [new_player_id, pName, pEmail, decoded.id, fName, lName, dateTime];

              db.query(pQuery, [newP], (error, results) => {
                if (error) {
                  console.log(error);
                } else {
                  //console.log(results);
                }
              });

              db.query("INSERT INTO teams_players(Team_ID, Players_ID, User_ID) VALUES ?", [teamP], (err, res1) => {
                if (err) {
                  console.log(err)
                }
                else { }
              });
            }

          }

          db.query('SELECT MAX(Drill_ID) as did from drills WHERE User_ID = ?', [decoded.id], (error3, results3) => {

            if (!error3) {

              // if more than one drill added in create team
              var newDr = [];
              var teamDr = [];
              var new_drill_id = results3[0].did + 1;
              var drillnum = new_drill_id;
              if (Array.isArray(drName)) {

                for (let i = 0; i < drName.length; i++) {
                  if (drName[i].length === 0) {
                    drName[i] = null;
                  }
                  if (drCategory[i].length === 0) {
                    drCategory[i] = null;
                  }
                  if (drType[i].length === 0) {
                    drType[i] = null;
                  }
                  if (drDescription[i].length === 0) {
                    drDescription[i] = null;
                  }
                  if (drLink[i].length === 0) {
                    drLink[i] = null;
                  }
                  new_drill_id = drillnum;
                  newDr[i] = [new_drill_id, drName[i], drCategory[i], drType[i], uid, dateTime, drDescription[i], drLink[i]];
                  teamDr[i] = [new_team_id, new_drill_id, uid]
                  drillnum = drillnum + 1;
                }
                db.query(drQuery, [newDr], (error, results) => {
                  if (error) {
                    console.log(error);
                  } else {
                    //console.log(results);
                  }
                });
  
                db.query("INSERT INTO teams_drills(Team_ID, Drill_ID, User_ID) VALUES ?", [teamDr], (err2, res2) => {
                  if (err2) {
                    console.log(err2)
                  }
                  else { }
                });

              }

              else {
                if (drName.length === 0) {
                  drName = null;
                }
                if (drCategory.length === 0) {
                  drCategory = null;
                }
                if (drType.length === 0) {
                  drType = null;
                }
                if (drDescription.length === 0) {
                  drDescription = null;
                }
                if (drLink.length === 0) {
                  drLink = null;
                }

                if ((drType === null) && (drCategory === null) && (drName === null
                ) && (drDescription === null) && (drLink === null)) {
                  console.log("Empty Row. Didn't append drill")
                }
                else {
                  teamDr[0] = [new_team_id, new_drill_id, uid,]
                  newDr[0] = [new_drill_id, drName, drCategory, drType, decoded.id, dateTime, drDescription, drLink];
                  db.query(drQuery, [newDr], (error, results) => {
                    if (error) {
                      console.log(error);
                    } else {
                      //console.log(results);
                    }
                  });

                  db.query("INSERT INTO teams_drills(Team_ID, Drill_ID, User_ID) VALUES ?", [teamDr], (err2, res2) => {
                    if (err2) {
                      console.log(err2)
                    }
                    else { }
                  });
                }

              }
              console.log("newP");
              console.log(newP)
              console.log("newDr:");
              console.log(newDr);

              var newTeamVals = [[uid, teamNm, new_team_id]];

              db.query("INSERT INTO teams (User_ID, Team_Name, Team_ID) VALUES ?", [newTeamVals], (error, results) => {
                if (error) {
                  console.log(error);
                }
                else {
                  //console.log(results);
                  console.log("Inserted new team: " + newTeamVals)
                  res.redirect("../HomePage/" + new_team_id);
                }
              })

            }
            else {
              console.log(error3);
            }
          });
        }
        else {
          console.log(error2)
        }
      });
    }
  });
}

