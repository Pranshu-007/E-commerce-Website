import nodemailer from 'nodemailer'

let transporter

function getTransporter() {
  if (!process.env.SMTP_HOST) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  }
  return transporter
}

export async function sendMail({ to, subject, text, html }) {
  if (!to) return
  const mailer = getTransporter()
  const from = process.env.MAIL_FROM || 'noreply@example.com'

  if (!mailer) {
    console.log(`[email:dev] to=${to} subject=${subject}\n${text || ''}`)
    return
  }

  await mailer.sendMail({ from, to, subject, text, html: html || text })
}

export async function sendPasswordResetEmail(to, resetUrl) {
  await sendMail({
    to,
    subject: 'Reset your password',
    text: `Reset your password using this link (valid for 1 hour):\n${resetUrl}`,
  })
}

export async function sendOrderEmail(to, order) {
  if (!to) return
  const lines = (order.items || [])
    .map((item) => `${item.name} (${item.size}) x${item.quantity} - ${item.price}`)
    .join('\n')
  await sendMail({
    to,
    subject: `Order ${order.status}: ${order._id}`,
    text: `Thanks for your order.\n\nStatus: ${order.status}\nTotal: ${order.amount}\n\n${lines}`,
  })
}
