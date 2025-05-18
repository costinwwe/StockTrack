const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  inviteUser,
  acceptInvite
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

// Base routes
router.route('/')
  .get(protect, getTeams)
  .post(protect, createTeam);

// Team ID routes
router.route('/:id')
  .get(protect, getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

// Invitation routes
router.route('/:id/invite')
  .post(protect, inviteUser);

router.route('/invite/:token')
  .get(protect, acceptInvite);

module.exports = router;