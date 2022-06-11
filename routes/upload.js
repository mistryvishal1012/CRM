const express    = require("express"),
router			 = express.Router();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
let Detail = require('../models/detail');
let fs = require('fs');
let dir = './public/uploads/';

let upload = multer({
  storage: multer.diskStorage({

    destination: (req, file, callback) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './public/uploads/');
    },
    filename: (req, file, callback) => { callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); }

  }),

  fileFilter: (req, file, callback) => {
    let ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(/*res.end('Only images are allowed')*/ null, false)
    }
    callback(null, true)
  }
});



router.get('/', (req, res) => {
  Detail.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.render('upload/upload', { data: data });
    }
  })

});

router.post('/', upload.any(), (req, res) => {

  if (!req.body && !req.files) {
    res.json({ success: false });
  } else {
    let c;
    Detail.findOne({}, (err, data) => {

      if (data) {
        c = data.unique_id + 1;
      } else {
        c = 1;
      }

      let detail = new Detail({

        unique_id: c,
        Name: req.body.title,
        image1: req.files[0] && req.files[0].filename ? req.files[0].filename : '',
        image2: req.files[1] && req.files[1].filename ? req.files[1].filename : '',
      });

      detail.save((err, Person) => {
        if (err)
          console.log(err);
        else
          res.redirect('/uploads/');

      });

    }).sort({ _id: -1 }).limit(1);

  }
});

router.post('/delete', (req, res) => {

  Detail.findByIdAndRemove(req.body.prodId, (err, data) => {

    // console.log(data);
    // remove file from upload folder which is deleted
    fs.unlinkSync(`./public/uploads/${data.image1}`);
    fs.unlinkSync(`./public/uploads/${data.image2}`);

  })
  res.redirect('/uploads/');
});

module.exports = router;