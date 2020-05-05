const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_ADDRESS,  // generated ethereal user
        pass: process.env.GMAIL_PASSWORD  // generated ethereal password
    }
});

const sendWelcomeEmail = (email, name) => {
    transporter.sendMail({
        from: GMAIL_ADRESS,
        to: email,
        subject: 'Welcome',
        text: `Welcome to Shopping Cart API ${name}.\nSincerely,\nShopping Cart API Manager.`
    }) 
}

const sendOrderUpdatedStatusEmail = (email, name, status) => {
    transporter.sendMail({
        from: GMAIL_ADRESS,
        to: email,
        subject: `Order Status`,
        text: `Dear Mr ${name},\nWe would like to confirm you that your order status had been updated to ${status}.\nSincerely,\nShopping Cart API Manager.`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendOrderUpdatedStatusEmail
}