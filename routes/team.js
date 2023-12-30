const express = require('express');
const teamController = require('../controllers/team');

const { urlencoded } = require('body-parser');

const router = express.Router();

//New modified routing functions for team

router.get('/viewPlayer/:playerid', teamController.viewPlayer);

router.post('/add-new-player', teamController.addNewPlayer);

router.post('/edit-player', teamController.updatePlayer);

router.post('/edit-team-name', teamController.updateTeamName)

router.post('/add-new-player-home/:tid', teamController.addNewPlayerHome);
router.post('/add-new-drill-home/:tid', teamController.addNewDrillHome)

router.post('/add-new-drill', teamController.addNewDrill);


router.post('/edit-drill', teamController.updateDrill);

 router.get('/viewPlayer/:playerid/:teamid', teamController.viewTeamPlayer);//done
 router.post('/add-new-player-team/:teamid', teamController.addNewTeamPlayer);//done
 router.post('/edit-player-team/:playerid/:teamid', teamController.edTeamPlayer);//done
 //router.get('/deletePlayer/:playerid/:teamid', teamController.deletePlayer);
 router.post('/add-new-drill-team/:teamid', teamController.addTeamDrill);//done
 router.post('/edit-drill-team/:drillid/:teamid', teamController.editDrillTeam);//done
 router.get('/view-plan/:planid/:teamid', teamController.viewTeamPlan);//done
 router.post('/edit-plan/:planid/:teamid', teamController.editTeamPlan);//done
// Untouched routing functions for team
router.post('/addTeam', teamController.addTeam);

router.get('/deleteDrill/:drillid/:teamid', teamController.deleteDrill);

router.post('/addPlan', teamController.addPlan);

router.post('/updatePlan', teamController.updatePlan)

router.post('/updateTeamPlan/:planid', teamController.updateTeamPlan)

router.get('/deleteTeam/:id', teamController.deleteTeam);

router.post('/changeTeam', teamController.changeTeam);

router.post('/deletePlayerAjax', teamController.deletePlayerAjax);

router.post('/deleteDrillAjax', teamController.deleteDrillAjax);

router.post('/deleteTeamPlayerAjax', teamController.deleteTeamPlayerAjax);

router.post('/deleteTeamDrillAjax', teamController.deleteTeamDrillAjax);

router.post('/deleteTeamAjax', teamController.deleteTeamAjax)

router.post('/deletePlanAjax', teamController.deletePlanAjax);

router.post('/deleteTeamPlanAjax', teamController.deleteTeamPlanAjax);

router.post('/uploadCsvPlayers', teamController.uploadFile);

router.post('/uploadCsvTeamPlayers/:teamid', teamController.uploadTeamFile)

router.post('/uploadCsvDrills', teamController.uploadCsvDrills);

router.post('/uploadCsvTeamDrills/:teamid', teamController.uploadCsvTeamDrills)

router.post('/editProfilePlayer', teamController.editProfilePlayer);





module.exports = router;