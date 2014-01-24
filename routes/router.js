var routes = require('./');
var AM = require('./accountManager');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var util	 	= require('util');
var ObjectId    = require('mongodb').ObjectID;
var nodemailer = require("nodemailer");
var cronJob = require('cron').CronJob;


/*function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}

new cronJob('5 0 * * *', function(){
	AM.getListsReminder(function(err, list){
		if(!err){
			for(var i=0; i<list.length; i++){	
				var day = new Date().getDate();
				var month = new Date().getMonth()+1;
				var year = new Date().getFullYear();
				var today = day +'-'+month+'-'+year;
				console.log(today);
				if (list[i].reminder < today){
					AM.getUserEmail(list[i].userid, list[i].name, function(err, email, task){
						if(!err){
							if(email){
								console.log('am treimist reminder');
								smtpTransport.sendMail({
								   from: "WebToDo++ <webtodoApp@gmail.com>", // sender address
								   to: "<" + email + ">", // comma separated list of receivers
								   subject: "ToDo reminder", // Subject line
								   text: "ToDo reminder: " + task // plaintext body
								}, function(error, response){
								   if(error){
								       console.log(error);
								   }else{
								       console.log("Message sent: " + response.message);
								   }
								});
							}
						}
					});
				}
			}
		}
	});
    
}, null, true, "America/Los_Angeles");*/



var smtpTransport = nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
       user: "webtodoApp@gmail.com",
       pass: "webtodopassword"
   }
});



module.exports = function(app, passport) {
	
	app.get('/', function(req, res){// console.log(req.user.id.toString());
		if(req.user){
			AM.findUserById(req.user.id, function(err, user) {
				if(!err){
					res.redirect('/home');
					//res.render("index.html");
				}
	        	else {
	        		res.render("index.html");
	        	}
			});
		} else {
			res.render("index.html");
		} 
	}); 

	app.post('/reg', function(request, response){
		AM.addNewAccount({
			username : request.body.newuser,
      		email 	 : request.body.signupmail,
      		passw    : request.body.signuppass
		}, function(err){
			if (err){
				response.send(err, 400);
			} else{
				AM.findUserByEmail(request.body.signupmail, function(err, user){
					if(err){
						response.redirect('/');
					} else { 
						request.logIn(user, function(err) {
						  if (err) {
						  	console.log(err);
						  	 response.redirect('/home');
						  	return;
						  }

						  // login success!
						  response.redirect('/home'); 
						});
					}
				});		
			}
		});
	});


	app.get('/home', function(req, res){
        if(req.user){
        	res.render("home.html");
		} else {
			res.redirect("/");
		} 
	});




	app.get('/facebookLogin', passport.authenticate('facebook'));
	app.get('/facebookLogin/callback', passport.authenticate('facebook', 
		{ successRedirect: '/home', failureRedirect: '/' }));

	passport.use(new FacebookStrategy({
    clientID: "479269268815732",
    clientSecret: "ad153070975eb199dfde56fe89402d5b",
    callbackURL: "http://localhost:3000/facebookLogin/callback"
	},
	  function(accessToken, refreshToken, profile, done) {
	    AM.facebookLogin(accessToken, profile.id, profile.displayName,function(err,user){
	    	return done(null, user);
	    });}
	));

	passport.serializeUser(function(user, done) {
		console.log("serializat user"+user.username);
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		AM.findUserById(new ObjectId(id), function(err, user) {
			//console.log("deserializat user"+user);
			if(!err) done(null, user);
        	else done(err, null);
		});
	});


	app.get('/twitterLogin', passport.authenticate('twitter'));
	app.get('/twitterLogin/callback', passport.authenticate('twitter',
		{ successReturnToOrRedirect: '/home', failureRedirect: '/' }));

	passport.use(new TwitterStrategy({
    consumerKey: "quW99MJDTaotKqvJlYyJg",
    consumerSecret: "vJPFfDnzjXfzpVmgApuXgu283pXgDgkgthMMx18k8pQ",
    callbackURL: "http://localhost:3000/twitterLogin/callback"
	},
	  function(token, tokenSecret, profile, done) {
	  	AM.twitterLogin(profile.id, profile.displayName, function(err,user){
	    	return done(null, user);
	    });}
	));

	app.post('/login',
		passport.authenticate('local', { successRedirect: '/home',
	                                   failureRedirect: '/'})
	);

	passport.use(new LocalStrategy({
		usernameField: 'signinmail',
		passwordField: 'signinpass'
	},
	function(username, password, done) {
	    AM.manualLogin(username, password, function(err, user){
			if (!user){
				return done(null, false, { message: err});
			}
			return done(null, user);
		});}
	));

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});


	app.post('/resetPassword', function(req, res){
		console.log("got the email: " + req.body.signinmail);
		AM.updatePassword(req.body.recoverPassword, function(err, pass){
			console.log("let's check");
			if(!err){
				console.log("no error");
				if(pass){
					console.log("got pass");
					smtpTransport.sendMail({
					   from: "WebToDo++ <webtodoApp@gmail.com>", // sender address
					   to: "<" + req.body.recoverPassword + ">", // comma separated list of receivers
					   subject: "New password", // Subject line
					   text: "This is your new password: " + pass // plaintext body
					}, function(error, response){
					   if(error){
					       console.log(error);
					   }else{
					       console.log("Message sent: " + response.message);
					   }
					});
				}
			}
			res.redirect('/');
		});
	});

}


function postMessage(access_token, message, response) {
    // Specify the URL and query string parameters needed for the request
    var url = 'https://graph.facebook.com/me/feed';
    var params = {
        access_token: access_token,
        message: message
    };

	// Send the request
    request.post({url: url, qs: params}, function(err, resp, body) {
      
      // Handle any errors that occur
      if (err) return console.error("Error occured: ", err);
      body = JSON.parse(body);
      if (body.error) return console.error("Error returned from facebook: ", body.error);

      // Generate output
      var output = '<p>Message has been posted to your feed. Here is the id generated:</p>';
      output += '<pre>' + JSON.stringify(body, null, '\t') + '</pre>';
      
      // Send output as the response
      response.writeHeader(200, {'Content-Type': 'text/html'});
      response.end(output);
    });

}

