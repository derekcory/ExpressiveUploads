//var mongoose = require('mongoose');
//mongoose.connect('mongodb://coryd:wasd123@ds249398.mlab.com:49398/capstone');
//var db = mongoose.connection;
/**var MongoUtil = require('../MongoUtil');
MongoUtil.connectToServer(function (err){
	console.log('In MongoUtil Handlebars');
});
var db = MongoUtil.getDB();**/
module.exports = {
		printUsers: function() {
			var mongoose = require('mongoose');
			mongoose.connect('mongodb://coryd:wasd123@ds249398.mlab.com:49398/capstone');
			var db = mongoose.connection;
			db.on("open", function(){
				console.log("Connected to mongo in printUsers");
			});
			html = "";
			html += db.collection('users').find({});
			console.log(db.collection('users').find());
			/**var html = "<ul></br>";
			for(var i=0; i<5; i++)
			{
				html += "<li>\n" 
				html += "Name: " + "users.name" + "</br>";
				html += "Email: " + "users.email" + "</br>";
				html += "Username: " + "users.username" + "</br>";
				html += "</li></br>"; 
			}
			html += "</ul>";**/
			//return JSON.stringify(html);
			return (db.collection('users').find());
		}
		// More helpers
}