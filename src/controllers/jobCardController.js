const JobCardService = require('../services/jobCardService');

const jobCardService = new JobCardService();

class JobCardController {
  async allocateJobCard(req, res) {
    try {
      const { incidentId, teamId } = req.body;
      const assignedById = req.user.id; // From auth middleware

      if (!incidentId || !teamId) {
        return res.status(400).json({
          success: false,
          message: 'Incident ID and Team ID are required'
        });
      }

      const jobCard = await jobCardService.allocateJobCard(incidentId, teamId, assignedById, req.body);

      res.status(201).json({
        success: true,
        message: 'Job card allocated successfully',
        data: jobCard
      });
    } catch (error) {
      console.error('Error allocating job card:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to allocate job card'
      });
    }
  }

  async getJobCardsForTeam(req, res) {
    try {
      const { teamId } = req.params;

      if (!teamId) {
        return res.status(400).json({
          success: false,
          message: 'Team ID is required'
        });
      }

      const jobCards = await jobCardService.getJobCardsForTeam(teamId);

      res.json({
        success: true,
        data: jobCards
      });
    } catch (error) {
      console.error('Error getting job cards for team:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get job cards'
      });
    }
  }

  async updateJobCardStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const updatedById = req.user.id;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['assigned', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const jobCard = await jobCardService.updateJobCardStatus(id, status, updatedById, notes);

      res.json({
        success: true,
        message: 'Job card status updated successfully',
        data: jobCard
      });
    } catch (error) {
      console.error('Error updating job card status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update job card status'
      });
    }
  }

  async getJobCardById(req, res) {
    try {
      const { id } = req.params;

      const jobCard = await jobCardService.getJobCardById(id);

      res.json({
        success: true,
        data: jobCard
      });
    } catch (error) {
      console.error('Error getting job card:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get job card'
      });
    }
  }

  async getAllJobCards(req, res) {
    try {
      const filters = req.query;
      const jobCards = await jobCardService.getAllJobCards(filters);

      res.json({
        success: true,
        data: jobCards
      });
    } catch (error) {
      console.error('Error getting all job cards:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get job cards'
      });
    }
  }
}

module.exports = JobCardController;