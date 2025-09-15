const Incident = require('../models/Incident');
const User = require('../models/User');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class IncidentService {
  async assignGuardian(incidentId) {
    try {
      const incident = await Incident.findById(incidentId).populate('guardianAssigned');
      if (!incident) {
        console.log('Incident not found for assignment:', incidentId);
        return null;
      }

      if (!incident.location || !incident.location.coordinates || (incident.location.coordinates[0] === 0 && incident.location.coordinates[1] === 0)) {
        console.log('Incident location not set, cannot assign guardian');
        return null;
      }

      // Assign nearest Guardian within 2km radius
      let guardian = null;
      try {
        const nearbyGuardians = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: incident.location.coordinates
              },
              distanceField: 'dist.calculated',
              maxDistance: 2000, // 2km in meters
              spherical: true,
              query: { role: 'Guardian' }
            }
          }
        ]);

        if (nearbyGuardians.length > 0) {
          guardian = nearbyGuardians[0];
          console.log(`Assigned nearest guardian ${guardian.userId} at ${guardian.dist?.calculated?.toFixed(0)}m from incident`);
        } else {
          console.log('No guardians within 2km radius');
        }
      } catch (geoError) {
        console.error('Geospatial query error:', geoError.message);
      }

      if (guardian && (!incident.guardianAssigned || incident.guardianAssigned._id.toString() !== guardian._id.toString())) {
        incident.guardianAssigned = guardian._id;
        await incident.save();
        console.log('Guardian assigned and saved:', guardian.userId);

        // Send notification to assigned guardian
        if (guardian.phone) {
          try {
            const message = `New incident reported (ID: ${incident._id}): ${incident.description}. Priority: ${incident.priority}. Location: lat ${incident.location.coordinates[1]}, lng ${incident.location.coordinates[0]}. Please go verify the incident.`;
            await client.messages.create({
              from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM || '+14155238886'}`,
              to: `whatsapp:${guardian.phone.startsWith('+') ? guardian.phone : '+27' + guardian.phone.substring(1)}`,
              body: message
            });
            console.log(`Notification sent to guardian ${guardian.userId} via WhatsApp`);
          } catch (notifyError) {
            console.error('Error sending notification to guardian:', notifyError.message);
          }
        }
      } else if (guardian) {
        console.log('Guardian already assigned, no change');
      }

      return guardian;
    } catch (err) {
      console.error('Error in assignGuardian:', err.message);
      throw err;
    }
  }

  async createIncident(incidentData) {
    try {
      console.log('Starting createIncident with data:', incidentData);

      // Basic triage for priority
      const description = incidentData.description.toLowerCase();
      let priority = 'P2';
      if (description.includes('overflow') || description.includes('sewer') || description.includes('emergency')) {
        priority = 'P0';
      } else if (description.includes('leak') || description.includes('backup')) {
        priority = 'P1';
      }
      console.log('Triage priority:', priority);

      // Find or create reporter user (basic, link by phone)
      let reporter = await User.findOne({ phone: incidentData.reporterPhone });
      if (!reporter) {
        // For now, create as Guardian or skip; in full, prompt registration
        reporter = null;
      }

      // Create incident
      const incident = new Incident({
        reporterPhone: incidentData.reporterPhone,
        description: incidentData.description,
        category: incidentData.category || 'other',
        priority,
        location: incidentData.location || { type: 'Point', coordinates: [0, 0] },
        mediaUrls: incidentData.mediaUrls || [],
        guardianAssigned: null
      });

      console.log('New incident object before save:', incident.toObject());

      const savedIncident = await incident.save();
      console.log('Saved incident ID:', savedIncident._id, 'full object:', savedIncident.toObject());

      // Estimate sewage loss (basic: P0 = 500L, P1 = 200L, P2 = 50L)
      savedIncident.sewageLossEstimate = priority === 'P0' ? 500 : priority === 'P1' ? 200 : 50;
      await savedIncident.save();
      console.log('Updated saved incident with estimate:', savedIncident.toObject());

      // Assign guardian if location is set
      if (savedIncident.location.coordinates[0] !== 0 || savedIncident.location.coordinates[1] !== 0) {
        await this.assignGuardian(savedIncident._id);
      }

      return savedIncident;
    } catch (err) {
      console.error('Error in createIncident:', err.message);
      console.error('Full error:', err);
      throw err;
    }
  }

  async getIncidents(filter = {}) {
    try {
      const incidents = await Incident.find(filter).populate('guardianAssigned').sort({ createdAt: -1 });
      console.log('Fetched incidents count:', incidents.length);
      return incidents;
    } catch (err) {
      console.error('Error in getIncidents:', err.message);
      throw err;
    }
  }

  async updateIncident(id, updateData) {
    try {
      const incident = await Incident.findByIdAndUpdate(id, { ...updateData, updatedAt: Date.now() }, { new: true });
      if (incident) {
        console.log('Updated incident ID:', incident._id);
        // Re-assign guardian if location updated
        if (updateData.location && (updateData.location.coordinates[0] !== 0 || updateData.location.coordinates[1] !== 0)) {
          await this.assignGuardian(incident._id);
        }
      } else {
        console.log('No incident found for update ID:', id);
      }
      return incident;
    } catch (err) {
      console.error('Error in updateIncident:', err.message);
      throw err;
    }
  }
}

module.exports = IncidentService;