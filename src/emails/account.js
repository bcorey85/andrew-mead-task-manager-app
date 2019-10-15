const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
     sgMail.send({
         to: email,
         from: 'bcorey85@gmail.com',
         subject: 'Welcome to Task Manager',
         text: `Hello ${name}!  Welcome to the Task Manager App!`
     })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bcorey85@gmail.com',
        subject: `Sorry to see you go ${name}!`,
        text: `Hi ${name}, we noticed you cancelled your account. Is there anything we can do to make our product better?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}