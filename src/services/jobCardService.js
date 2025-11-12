const JobCard = require('../models/JobCard');
const Incident = require('../models/Incident');
const Team = require('../models/Team');
const User = require('../models/User');

class JobCardService {
  async allocateJobCard(incidentId, teamId, assignedById, options = {}) {
    try {
      // Verify incident exists and is verified
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        throw new Error('Incident not found');
      }

      if (incident.status !== 'verified') {
        throw new Error('Incident must be verified before allocation');
      }

      // Verify team exists and is active
      const team = await Team.findById(teamId);
      if (!team || !team.active) {
        throw new Error('Team not found or inactive');
      }

      // Verify assignedBy user exists
      const assignedBy = await User.findById(assignedById);
      if (!assignedBy) {
        throw new Error('Assigning user not found');
      }

      // Check if job card already exists for this incident
      const existingJobCard = await JobCard.findOne({ incident: incidentId });
      if (existingJobCard) {
        throw new Error('Job card already exists for this incident');
      }

      // Create job card
      const jobCardData = {
        incident: incidentId,
        team: teamId,
        assignedBy: assignedById,
        description: incident.description,
        location: incident.location,
        priority: incident.priority || 'P2',
        mediaUrls: incident.mediaUrls || [],
        ...options
      };

      const jobCard = new JobCard(jobCardData);
      await jobCard.save();

      // Update incident status to allocated
      await Incident.findByIdAndUpdate(incidentId, { status: 'allocated' });

      // Populate references for response
      await jobCard.populate([
        { path: 'incident' },
        { path: 'team', populate: { path: 'leader members' } },
        { path: 'assignedBy' }
      ]);

      return jobCard;
    } catch (error) {
      console.error('Error allocating job card:', error);
      throw error;
    }
  }

  async getJobCardsForTeam(teamId) {
    try {
      const jobCards = await JobCard.find({ team: teamId })
        .populate('incident')
        .populate('team')
        .populate('assignedBy')
        .sort({ createdAt: -1 });

      return jobCards;
    } catch (error) {
      console.error('Error getting job cards for team:', error);
      throw error;
    }
  }

  async updateJobCardStatus(jobCardId, status, updatedById, notes = null) {
    try {
      const jobCard = await JobCard.findById(jobCardId);
      if (!jobCard) {
        throw new Error('Job card not found');
      }

      // Update status
      jobCard.status = status;

      // Set completion date if completed
      if (status === 'completed') {
        jobCard.actualCompletion = new Date();
      }

      // Add notes if provided
      if (notes) {
        jobCard.notes.push({
          text: notes,
          addedBy: updatedById
        });
      }

      await jobCard.save();

      // Update incident status if job card is completed
      if (status === 'completed') {
        await Incident.findByIdAndUpdate(jobCard.incident, { status: 'resolved' });
      }

      await jobCard.populate([
        { path: 'incident' },
        { path: 'team' },
        { path: 'assignedBy' }
      ]);

      return jobCard;
    } catch (error) {
      console.error('Error updating job card status:', error);
      throw error;
    }
  }

  async getJobCardById(jobCardId) {
    try {
      const jobCard = await JobCard.findById(jobCardId)
        .populate('incident')
        .populate('team')
        .populate('assignedBy');

      if (!jobCard) {
        throw new Error('Job card not found');
      }

      return jobCard;
    } catch (error) {
      console.error('Error getting job card:', error);
      throw error;
    }
  }

  async getAllJobCards(filters = {}) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.team) {
        query.team = filters.team;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      const jobCards = await JobCard.find(query)
        .populate('incident')
        .populate('team')
        .populate('assignedBy')
        .sort({ createdAt: -1 });

      return jobCards;
    } catch (error) {
      console.error('Error getting all job cards:', error);
      throw error;
    }
  }
}

module.exports = JobCardService;