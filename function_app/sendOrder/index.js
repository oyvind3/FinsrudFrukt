const sgMail = require('@sendgrid/mail');

module.exports = async function (context, req) {
  // Ensure API key and email addresses are configured in environment settings
  const apiKey = process.env.SENDGRID_API_KEY;
  const toEmail = process.env.SENDGRID_TO_EMAIL;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    context.log('SendGrid environment variables missing');
    context.res = {
      status: 500,
      body: 'Email not configured'
    };
    return;
  }

  sgMail.setApiKey(apiKey);
  const data = req.body || {};
  const items = data.items || [];
  const total = data.totalPrice || 0;

  const itemLines = items.map(item => `${item.quantity} kg ${item.name} (${item.variety}) – ${item.total.toFixed(2)} NOK`).join('\n');
  const subject = 'New fruit order';
  const text = `New order received:\n${itemLines}\nTotal: ${total.toFixed(2)} NOK`;

  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: subject,
    text: text
  };

  try {
    await sgMail.send(msg);
    context.res = {
      status: 200,
      body: 'Order email sent'
    };
  } catch (error) {
    context.log('Error sending email', error);
    context.res = {
      status: 500,
      body: 'Failed to send order email'
    };
  }
};
