import { Router } from 'express';
import { Resend } from 'resend';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// We use an internal endpoint that our frontend can trigger, 
// or ideally Supabase Webhooks would call this in a real prod environment.
// For the MVP, we let the frontend securely invoke it if needed, or other Express routes.

router.post('/send', async (req, res) => {
  try {
    const { to, type, data } = req.body;
    let subject = 'FundHub Notification';
    let html = '<p>You have a new notification.</p>';

    switch (type) {
      case 'donation_success':
        subject = 'Thank you for your donation!';
        html = `<h1>Donation Successful</h1><p>Thank you for donating ${data.amount} ${data.currency} to ${data.ngoName}. Your support makes a difference.</p>`;
        break;
      case 'ngo_approved':
        subject = 'Your NGO has been approved!';
        html = `<h1>Approval Confirmed</h1><p>Congratulations ${data.ngoName}, your NGO account is now active. You can start receiving donations.</p>`;
        break;
      case 'distribution_completed':
        subject = 'Donation Distributed!';
        html = `<h1>Update on your donation</h1><p>The NGO has successfully distributed ${data.amount} for: ${data.notes}. Thank you!</p>`;
        break;
      case 'proof_verified':
        subject = 'Distribution Proof Verified';
        html = `<h1>Proof Verified</h1><p>An admin has verified the proof of distribution for your donation.</p>`;
        break;
      case 'fraud_alert':
        subject = '🚨 URGENT: Suspicious Activity Detected';
        html = `<h1>Fraud Alert</h1><p>Suspicious activity detected on entity ID: ${data.id}. Reason: ${data.reason}. Please review immediately.</p>`;
        break;
    }

    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('placeholder')) {
      const response = await resend.emails.send({
        from: 'FundHub <onboarding@resend.dev>',
        to,
        subject,
        html,
      });
      return res.json({ success: true, response });
    }

    // Mock notification fallback for local development / viva demos
    return res.json({ success: true, simulated: true, to, subject });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
