const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const authController = require('../controllers/auth');
const authRoutes = require('../routes/auth');
const { each } = require("jquery");

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


exports.getPlayers = async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  var uid = decoded.id
  var playersTable= []
  var players_teamNames_temp = []
  var listOfTeamArray = []
  db.query('SELECT * FROM teams WHERE User_ID = ?', [decoded.id], (teamListError, listOfTeam) => {
    if(teamListError) {
      console.log(teamListError);
    }
    else if(listOfTeam.length != 0) {
      for (var x = 0; x < listOfTeam.length; x++) {
        listOfTeamArray[x] = {Team_ID: listOfTeam[x].Team_ID, Team_Name: listOfTeam[x].Team_Name, Created: listOfTeam[x].Created}
      }
    }
    else {
      listOfTeamArray[0] = {Team_ID: '', Team_Name: 'Empty', Created:''}
    }

  });
    

    db.query('SELECT teams_players.Players_ID, players.First_Name ,teams.Team_Name from players JOIN teams_players ON players.Players_ID = teams_players.Players_ID JOIN teams ON teams_players.Team_ID = teams.Team_ID WHERE players.User_ID = ? AND teams_players.User_ID = ? AND teams.User_ID = ? ORDER BY teams_players.Players_ID', [uid, uid, uid], (error_teams_players, teamsData) => {
        if (error_teams_players) {
            console.log(error_teams_players);}
        else if (teamsData.length != 0){
            //console.log("sorted: ", teamsData.sort())
            db.query('SELECT * from players WHERE User_ID = ? ORDER BY players.Players_ID', [uid], (error_playersData, playersData ) => {
                if(error_playersData) {
                    console.log(error_playersData);
                }
                else if(playersData.length != 0) {
                    var counter = 0;
                    var teamNames_counter = 0;
                    players_id = []
                    for (var n = 0; n < teamsData.length; n++) {
                        if(teamsData[n].Players_ID != undefined){
                            players_id[n] =  teamsData[n].Players_ID
                        }
                        
                        
                    }
                   // players_id = players_id.sort();
                    for (var h =0; h< playersData.length; h++) {
                        //console.log("format", playersData[h].Players_ID)
                        
                    }

                    for (var y =0; y< players_id.length; y++) {
                        
                        //console.log("formattwo", players_id[y])
                    }
                   // console.log("teamsData: ",teamsData)

                    //console.log( "playerDate.length", playersData.length)
                    //console.log( "players_id.length", players_id.length)
                    
                    
                    //console.log("PlayersData > 0")

                    //console.log("playersData.length: ", playersData.length)
                    //console.log("teamsData.length: ", players_id)
                    while(counter != playersData.length) {
                        if (playersData[counter].Players_ID == players_id[teamNames_counter]) {
                            //console.log("playersData[counter].Players_ID: ", playersData[counter].Players_ID, " vs. ", "players_id[teamNames_counter]: ", players_id[teamNames_counter])
                            //console.log( "playersData[counter].Players_ID: ",playersData[counter].Players_ID)
                            //console.log("counter: ", counter)
                            //console.log("teamNameCounter: ", teamNames_counter)
                            //console.log( "playersData[counter].Players_ID: ",playersData[counter].Players_ID)
                            //console.log("teamsData[teamNames_counter].Team_Name",teamsData[teamNames_counter].Team_Name)
                            players_teamNames_temp[counter]= teamsData[teamNames_counter].Team_Name;
                            
                            // if(teamNames_counter < players_id.length){
                            //     teamNames_counter += 1
                            // }
                            
                            teamNames_counter +=1
                            counter += 1
                            
                        }
                        else {
                            players_teamNames_temp[counter] = "Unassigned";
                            counter += 1
                        }
                    } // end of while loop

                   // console.log("players_teamNames_temp: ", players_teamNames_temp)

                    for (var i = 0; i < playersData.length; i++) {
                        var finalPlayerDate= 'No date';
                        if(playersData[i].Created != null){
                            var playerDate = playersData[i].Created
                            playerDate = ''.concat(playerDate).replaceAll(',', "")
                            finalPlayerDate = new Date(playerDate)
                            finalPlayerDate = finalPlayerDate.getMonth() + 1 + '/' + finalPlayerDate.getDate() + '/' + finalPlayerDate.getFullYear()
                        }
                        playersTable[i] = {Players_ID: playersData[i].Players_ID, First_Name: playersData[i].First_Name, Last_Name: playersData[i].Last_Name
                                            , P_Email: playersData[i].P_Email, Created:finalPlayerDate ,P_Team: players_teamNames_temp[i]}
                    }

                    //console.log("What's in playersTable in this case: ", playersTable)
                    res.render('players', {playersTable, listOfTeamArray});
                }
                else {
                    //console.log("empty")
                    playersTable = playersData;
                    res.render('players', {playersTable, listOfTeamArray});
                }
            });//end of query
        }
        else {
            //console.log("it equals: 0")
            db.query('SELECT * from players WHERE User_ID = ?', [uid], (error_playersData, playersData ) => {
                if(error_playersData) {
                    console.log(error_playersData);
                }
                else if(playersData.length != 0) {
                    var finalPlayerDate= 'No date'
                    for (var i = 0; i < playersData.length; i++) {
                        if(playersData[i].Created != null){
                            var playerDate = playersData[i].Created
                            playerDate = ''.concat(playerDate).replaceAll(',', "")
                            finalPlayerDate = new Date(playerDate)
                            finalPlayerDate = finalPlayerDate.getMonth() + 1 + '/' + finalPlayerDate.getDate() + '/' + finalPlayerDate.getFullYear()
                        }
                        
                        playersTable[i] = {Players_ID: playersData[i].Players_ID, First_Name: playersData[i].First_Name, Last_Name: playersData[i].Last_Name
                            , Created:finalPlayerDate , P_Email: playersData[i].P_Email, P_Team: "Unassigned"}
                    }

                    res.render('players', {playersTable, listOfTeamArray});
                }
                else {
                    //console.log("empty") 
                    playersTable = playersData;
                    res.render('players', {playersTable, listOfTeamArray});

                }
            });//end of query
            
        }
        
    }); 
}


exports.getDrills = async (req, res) => {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    var uid = decoded.id
    db.query('SELECT * from drills WHERE User_ID = ?', [uid], (error, results) => {
        if (error) console.log(error);

        res.render('drills', { results });
    });
}


// exports.getPlans = async (req, res) => {
//     const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
//     var uid = decoded.id
//     db.query('SELECT * from plans WHERE User_ID = ?', [uid], (error, results) => {
//         if (error) console.log(error);
//         //console.log(results)

//         db.query('SELECT * FROM players WHERE User_ID = ?', [uid], (error2, playersresults) => {
            
//             if (error2) console.log(error2);
//             res.render('view-plan-table', {results , playersresults, teamArray})

//         })

//     });
// }

exports.getPlans = async (req, res) => {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    var uid = decoded.id
    var plansTable= []
    var plans_teamNames_temp = []

    var playersresults= []

    db.query('SELECT * FROM players WHERE User_ID = ?', [uid], (error2, playersresult) => {
        if (error2) console.log(error2);
        playersresults = playersresult;
        
    })
    

    db.query('SELECT teams_plans.Plan_ID, plans.Name ,teams.Team_Name from plans JOIN teams_plans ON plans.Plan_ID = teams_plans.Plan_ID JOIN teams ON teams_plans.Team_ID = teams.Team_ID WHERE plans.User_ID = ? AND teams_plans.User_ID = ? AND teams.User_ID = ? ORDER BY teams_plans.Plan_ID', [uid, uid, uid], (error_teams_plans, teamsData) => {
        if (error_teams_plans) {
            console.log(error_teams_plans);}
        else if (teamsData.length != 0){
            console.log("teamsData ", teamsData)
            db.query('SELECT * from plans WHERE User_ID = ? ORDER BY Plan_ID', [uid], (error_plansData, plansData ) => {
                if(error_plansData) {
                    console.log(error_plansData);
                }
                else if(plansData.length != 0) {
                    var counter = 0;
                    var teamNames_counter = 0;
                    plans_id = []
                    for (n = 0; n < teamsData.length; n++) {
                        plans_id[n] =  teamsData[n].Plan_ID
                    }
                    //plans_id = plans_ids.sort();

                    console.log("plansid: ", plans_id)
                    
                    while(counter != plansData.length) {
                        if (plansData[counter].Plan_ID == plans_id[teamNames_counter]) {
                            plans_teamNames_temp[counter]= teamsData[teamNames_counter].Team_Name;
                            
                            teamNames_counter +=1
                            
                            counter += 1
                            
                        }
                        else {
                            plans_teamNames_temp[counter] = "Unassigned";
                            counter += 1
                        }
                    } // end of while loop

                    for (var i = 0; i < plansData.length; i++) {
                        var finalPlanDate= 'No date';
                        if(plansData[i].Created != null){
                            var planDate = plansData[i].Created
                            planDate = ''.concat(planDate).replaceAll(',', "")
                            finalPlanDate = new Date(planDate)
                            finalPlanDate = finalPlanDate.getMonth() + 1 + '/' + finalPlanDate.getDate() + '/' + finalPlanDate.getFullYear()
                        }
                        plansTable[i] = {Plan_ID: plansData[i].Plan_ID, Name: plansData[i].Name, Created:finalPlanDate,P_Team: plans_teamNames_temp[i]}
                    }

                    //console.log("What's in playersTable in this case: ", playersTable)
                    res.render('view-plan-table', {plansTable, playersresults});
                }
                else {
                    //console.log("empty")
                    plansTable = plansData;
                    res.render('view-plan-table', {plansTable, playersresults});
                }
            });//end of query
        }
        else {
            //console.log("it equals: 0")
            db.query('SELECT * from plans WHERE User_ID = ?', [uid], (error_plansData, plansData ) => {
                if(error_plansData) {
                    console.log(error_plansData);
                }
                else if(plansData.length != 0) {
                    var finalPlanDate= 'No date'
                    for (var i = 0; i < playersData.length; i++) {
                        var finalPlanDate= 'No date';
                        if(plansData[i].Created != null){
                            var planDate = plansData[i].Created
                            planDate = ''.concat(planDate).replaceAll(',', "")
                            finalPlanDate = new Date(planDate)
                            finalPlanDate = finalPlanDate.getMonth() + 1 + '/' + finalPlanDate.getDate() + '/' + finalPlanDate.getFullYear()
                        }
                        
                        plansTable[i] = {Plan_ID: plansData[i].Plan_ID, Name: plansData[i].Name, Created:finalPlanDate, P_Team: "Unassigned"}
                    }

                    res.render('view-plan-table', {plansTable, playersresults});
                }
                else {
                    //console.log("empty") 
                    plansTable = plansData;
                    res.render('view-plan-table', {plansTable, playersresults});

                }
            });//end of query
            
        }
        
    }); 

}


// exports.getNew = (req, res) =>{
//     res.render('new');
// }
