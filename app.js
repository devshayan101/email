const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv/config');
const fs = require('fs-extra')
const multer = require('multer')

const app = express();

// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//File-Upload to server
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//Init Upload
const upload = multer({
  storage: storage
}).fields([{ name: 'aadhaarFile', maxCount: 1 },
{ name: 'panFile', maxCount: 1 }]);


//ROUTES
app.get('/', (req, res) => {
  res.render('contact');
});

app.post('/send', upload, (req, res, err) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;
  const userOutput = `
    <p>Your form have been submitted successfully.</p>
    <p>Following are the details submitted by you</p> 
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  let imgPath = req.files.panFile[0].path;
  let imgPathString = imgPath.toString();
  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    //let testAccount = await nodemailer.createTestAccount(); 

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.USER, // generated ethereal user
        pass: process.env.PASS // generated ethereal password
      }

    });



    // send mail with defined transport object
    //This is Admin Mailing.
    let infoAdmin = await transporter.sendMail({
      from: '"Fred Foo" <foo@example.com>', // sender address
      to: 'shayan.devtest@gmail.com', // list of receivers
      subject: 'Hello ✔', // Subject line
      text: 'Hello world?', // plain text body
      html: output, // html body
      attachments: [
        {

        }
      ]
    });

    //This is customer mailing.
    let infoCust = await transporter.sendMail({
      from: '"Fred Foo" <foo@example.com>', // sender address
      to: `${req.body.email}`, // list of receivers
      subject: 'Hello ✔', // Subject line
      text: 'Hello world?', // plain text body
      html: userOutput // html body
    });

    res.render('contact', { msg: 'Email has been sent' })
  }

  main().catch(console.error);
  //res.render('contact', { msg: 'Email has been sent' });
});

app.listen(process.env.PORT, () => console.log(`Server started on Port ${process.env.PORT}`));