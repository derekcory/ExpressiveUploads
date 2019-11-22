var express = require('express');
var router = express.Router();
var User = require('../models/user');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var path = require('path');
var ObjectID = require('mongodb').ObjectID;

/** TESTING **/
let gfs;
let readstream;
let mime;
let filename;
let origname;

const conn = mongoose.createConnection('mongodb://coryd:wasd@ds249398.mlab.com:49398/capstone');

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads'); //Specifies what collection to use for the uploaded files
});

//Creating the storage engine
const storage = new GridFsStorage({
  url: 'mongodb://coryd:wasd@ds249398.mlab.com:49398/capstone',
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        console.log(file.originalname);
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: [{'owner': req.user.username},
          			{'originalname': file.originalname}] //Need to get this working
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });



/** Testing GET AND POST FROM FORMS **/
//Uploads a file
router.post('/upload', upload.single('file'), (req, res) => {
	res.redirect('/');
});

//Displays all of a users files
router.get('/', ensureAuthenticated, (req, res) => {
	gfs.files.find({'metadata': {'owner': req.user.username}}).toArray((err, files) => {
		if(!files || files.length === 0)
		{
			res.render('index', {files: false});
		}
    
		else
		{
			res.render('index', {files: files});
		}
	});
});

//Downloads a file if the down arrow was pressed
router.get('/files/:id', ensureAuthenticated, (req, res) => {
	gfs.files.find({'_id': new ObjectID(req.params.id)}).toArray((err, file) => {
		if (err){
			return res.status(400).send(err);
		}
		else if(!file){
			return res.status(404).send("File was not found");
		}
		mime = file[0].contentType;
		filename = file[0].filename;
		origname = file[0].metadata[1].originalname;
		console.log(ObjectID(req.params.id));
		console.log("Mime: " + mime);
		console.log("Filename: " + filename);
		console.log("Original Name: " + origname);
		res.set('Content-Type', mime);
		res.set('Content-Disposition', 'attachment; filename="' + origname + '"'); //origname was filename
		readstream = gfs.createReadStream({
			'_id': req.params.id,
			'root': 'uploads'
		});

		readstream.on('error', function(err){
			res.end();
		});
		readstream.pipe(res);
	});
});

//Deletes a file if the trash icon is pressed
router.delete('/files/:id', ensureAuthenticated, (req, res) => {
	gfs.remove({'_id': req.params.id, 'root': 'uploads'}, (err, gridStore) => {
		if (err)
			return res.status(404).json({err: err});
		res.redirect('/');
	})
});

/** END TESTING **/

/**router.get('/',ensureAuthenticated, function(req, res){
	User.find({}, function(err, user){
		for(var i = 0; i < user.length; i++)
		{
			var userInfo = user[i];
		};
		res.render('index', {userInfo: user});
	});
});**/

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated())
	{
		return next();
	}
	else
	{
		//req.flash('error_msg', 'You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;