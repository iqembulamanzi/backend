const Incident = require('../models/Incident');
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class NotificationService {
  async notifyReporters(incidentId, customMessage = null) {
    try {
      const incident = await Incident.findById(incidentId).populate('reporters');
      if (!incident || !incident.reporters || incident.reporters.length === 0) {
        console.log('No incident or reporters found for notification:', incidentId);
        return;
      }

      // Get unique phones
      const uniquePhones = [...new Set(incident.reporters.map(r => r.phone))];
      console.log(`Notifying ${uniquePhones.length} unique reporters for incident ${incidentId}`);

      const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM || '+14155238886'}`;

      for (const phone of uniquePhones) {
        let formattedPhone = phone;
        if (!phone.startsWith('+')) {
          formattedPhone = '+27' + phone.substring(1);  // Assume SA numbers
        }
        const toNumber = `whatsapp:${formattedPhone}`;

        const message = customMessage || `Update for incident ${incident._id}: Status is now ${incident.status}.`;

        try {
          await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber
          });
          console.log(`Notification sent to ${phone} for incident ${incidentId}`);
        } catch (notifyError) {
          console.error(`Failed to send to ${phone}:`, notifyError.message);
          // Optional: Retry logic or log for manual send
        }

        // Basic rate limiting: 1 sec delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error('Error in notifyReporters:', err.message);
      throw err;
    }
  }

  // Specific method for verification notification
  async notifyVerification(incidentId) {
    const message = `The incident (${incidentId}) has been verified and should be resolved in the next 72 hours. Thank you for reporting!`;
    await this.notifyReporters(incidentId, message);
  }
}

module.exports = NotificationService;