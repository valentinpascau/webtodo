
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'webusers';
var crypto 		= require('crypto');
var util	 	= require('util');
var check 		= require('validator').check;
var ObjectId    = require('mongodb').ObjectID;
var generatePassword = require('password-generator');

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(err, db){
	if (err) {
		console.log(err);
	}	else{
		console.log('connected to database :: ' + dbName);
	}
});
var accounts = db.collection('accounts');
var lists = db.collection('lists');
var groups = db.collection('groups');

/* login validation methods */

exports.addNewAccount = function(newData, callback)
{	
	try{
		check(newData.username,'Usarname too short').notNull().len(2, 64);
		check(newData.email,'Invalid email').notNull().len(6, 64).isEmail();
		check(newData.passw,'Password too short').notNull().len(6, 64);

		accounts.findOne({username:newData.username}, function(err, obj) {
			if(err){
				console.log('Database error:' + err);
			} else {
				if (obj){
					callback('username-taken');
				}	else{
					accounts.findOne({email:newData.email}, function(err, obj) {
						if (obj){
							callback('email-taken');
						}	else{
								getHash(newData.passw, function(hash){
								newData.passw = hash;					
								newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
								accounts.insert(newData, {safe: true}, callback);
							});					
						}
					});
				}
			}
		});
	} catch(e){
		callback(e.message);
	}
		
}

exports.facebookLogin = function(accessToken, id, username, callback){
	accounts.findOne({id:id}, function(err,obj) {
		if(obj){
			callback(null,obj);
		} else {
			accounts.insert({id: id, username: username, accessToken: accessToken,
				date: moment().format('MMMM Do YYYY, h:mm:ss a')}, {safe: true}, 
				function(err,obj2){
				if(obj2){
					accounts.findOne({id:id}, function(err,obj) {
						if(obj){
							callback(null,obj);	
						} else {
							callback(err);	
						}
					});	
				} else {
					callback(err);
				}
			});
		}
	});
}

exports.twitterLogin = function(id, username, callback){
	accounts.findOne({id:id}, function(err,obj) {
		if(obj){
			callback(null,obj);
		} else {
			accounts.insert({id: id, username: username, 
				date: moment().format('MMMM Do YYYY, h:mm:ss a')}, {safe: true}, 
				function(err,obj2){
				if(obj2){
					accounts.findOne({id:id}, function(err,obj) {
						if(obj){
							callback(null,obj);	
						} else {
							callback(err);	
						}
					});	
				} else {
					callback(err);
				}
			});
		}
	});
}

exports.verifyUserName = function(username, callback)
{
	accounts.findOne({username:username}, function(err,obj) {
		if(obj){
			callback(1);
		} else {
			callback(0);
		}
	});
}

exports.verifyEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(err,obj) {
		if(obj){
			callback(1);
		} else {
			callback(0);
		}
	});
}

exports.autoLogin = function(email, passw, callback)
{
	accounts.findOne({email:email}, function(err, obj) {
		if (obj){
			obj.passw == passw ? callback(obj) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.autoLoginExt = function(id, callback)
{
	accounts.findOne({id:id}, function(err, obj) {
		if (obj){
			callback(obj);
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(signinmail, signinpass, callback)
{	
	accounts.findOne({email:signinmail}, function(err, obj) {
		if (obj == null){
			callback('invalid username or password');
		}	else{
			validatePassword(signinpass, obj.passw, function(err, res) {
				if (res){
					callback(null, obj);
				}	else{
					callback('invalid username or password');
				}
			});
		}
	});
}

function getHash(passw, callback){
 	md5 = crypto.createHash('md5');
   	callback(md5.update(passw).digest('hex'));
}

var validatePassword = function(plainPass, hashedPass, callback)
{	
	getHash(plainPass, function(hash){
		plainPass = hash;					
		callback(null, plainPass === hashedPass);
	});	
}

exports.findUserById = function(id, callback)
{
	accounts.findOne({_id: id}, function(err,user) {
		if(user){
			callback(null, user);
		} else {
			callback(err, user);
		}
	});
}

exports.getUserName = function(id, callback)
{
	accounts.findOne({_id: ObjectId(id)}, function(err,user) {
		if(user){
			callback(null, user.username);
		} else {
			callback('user not found');
		}
	});
}

exports.getUserEmail = function(id, task, callback)
{
	accounts.findOne({_id: ObjectId(id)}, function(err,user) {
		if(user){
			if(user.email){
				callback(null, user.email, task);
			} else {
				callback(null, null);
			}
		} else {
			callback('user not found');
		}
	});
}

exports.findUserByEmail = function(email, callback)
{
	accounts.findOne({email: email}, function(err,user) {
		if(user){
			callback(null, user);
		} else {
			callback(err, user);
		}
	});
}

exports.updatePassword = function(email, callback)
{
	if (typeof(email) != 'undefined'){
		//console.log("updating: "+ email);
		accounts.findOne({email: email}, function(err,user) {
			if(user){
				pass = generatePassword();
				//console.log("this is the pass: "+pass);
				getHash(pass, function(passHash){
					//console.log("this is the hash: "+passHash);
					accounts.update( { email: email }, {username: user.username,
													    email: user.email,
													    passw: passHash,
													    date: user.date,
													    _id: user._id},
													    function(err, data){
						if(!err){
							//console.log("no error");
							if(data){//console.log("data found");
								callback(null, pass);
							} else { //console.log("no data");
								callback(null, null);
							}
						} else {
							callback(err, pass);
						}
					});
					
				});	
			} else {
				console.log("no user");
				callback("no data", null);
			}
		});
	}
	else {
		console.log("email is undefined");
		callback("no data", null);
	}
}

exports.addListGroup = function(newData, callback){
	if(!newData.listName){
		console.log('no name');
		callback('no name');
	} else {
		groups.findOne({listName: newData.listName}, function(err, obj){
			if(obj){
				if(newData.userid == obj.userid){
					callback('exista');
				} else {
					groups.insert(newData, {safe: true}, function(err, obj){
						if(obj){
							callback(null, obj[0]);
						}
					});
				}			
			} else {
				groups.insert(newData, {safe: true}, function(err, obj){
					if(obj){
						callback(null, obj[0]);
					}
				});
			}
		});	
	}
}

exports.deleteListGroup = function(newData, callback){
	console.log("am primit: "+newData.id);
	groups.findOne({ _id: ObjectId(newData.id) }, function(err, obj){
		if(obj){
			console.log('am gasit: '+obj._id)
			groups.remove({_id: obj._id}, function(err, data){
				if(!err){
					callback(null, newData.id);
				}
			});
		} else {
			callback('not found');
		}
	});	
}

exports.addToDo = function(newData, callback){

	var ok = 1;
	if(!newData.name){
		console.log('no name');
		callback('no name');
	} else {
		lists.find( {name: newData.name}, function(err, cursor){
			if(!err){

				cursor.each(function(err, obj){				
					if(obj){
						if( (obj.group == newData.group) && (obj.userid == newData.userid)){
							ok = 0;
							console.log("am gasit acelasi");
						}
					} else {
						if(ok == 1){
							lists.insert(newData, {safe: true}, function(err, obj){
								if(obj){
									callback(null, obj[0]);
								}
							});
						} else {
							callback('exista');
						}
					}
				});			
			}
		});
	}
}

exports.deleteList = function(newData, callback){
	console.log("am primit: "+ newData.id);
	lists.findOne({ _id: ObjectId(newData.id) }, function(err, obj){
		if(obj){
			console.log('am gasit: '+obj._id)
			lists.remove({_id: obj._id}, function(err, data){
				if(!err){
					callback(null, newData.id);
				}
			});
		} else {
			callback('not found');
		}
	});	
}

exports.groupSetOrder = function(newData, callback){
	accounts.findOne({_id: ObjectId(newData.userid)}, function(err,user) {
		if(user){
			user.groupOrder = newData.groupOrder;
			accounts.update({_id: user._id}, user, function(err, user2){
				if(user2){
					callback(null, user);
				} else {
					callback('nu s-a adaugat');
				}
			});			
		} else {
			callback('nu exista user');
		}
	});
}

exports.groupGetOrder = function(userid, callback){
	accounts.findOne({_id: ObjectId(userid)}, function(err,user) {
		if(user){
			callback(null, user.groupOrder);		
		} else {
			callback('nu exista user');
		}
	});
}

exports.setPriority = function(newData, callback){
	lists.findOne({_id: ObjectId(newData.id)}, function(err,obj) {
		if(obj){
			obj.priority = newData.priority;
			lists.update({_id: obj._id}, obj, function(err, data){
				if(!err){
					callback(null, obj);
				} else {
					callback('nu s-a adaugat');
				}
			});			
		} else {
			callback('nu exista user');
		}
	});
}

exports.setNote = function(newData, callback){
	lists.findOne({_id: ObjectId(newData.id)}, function(err,obj) {
		if(obj){
			obj.note = newData.note;
			lists.update({_id: obj._id}, obj, function(err, data){
				if(!err){
					callback(null, obj);
				} else {
					callback('nu s-a adaugat');
				}
			});			
		} else {
			callback('nu exista user');
		}
	});
}

exports.getNote = function(newData, callback){
	lists.findOne({_id: ObjectId(newData.id)}, function(err,obj) {
		if(obj){
			callback(null, obj);
		} else {
			callback('nu s-a gasit');
		}
	});
}

exports.setdate = function(newData, callback){
	lists.findOne({_id: ObjectId(newData.id)}, function(err,obj) {
		if(obj){
			obj.date = newData.date;
			lists.update({_id: obj._id}, obj, function(err, data){
				if(!err){
					callback(null, obj);
				} else {
					callback('nu s-a adaugat');
				}
			});			
		} else {
			callback('nu exista user');
		}
	});
}

exports.setReminder = function(newData, callback){
	lists.findOne({_id: ObjectId(newData.id)}, function(err,obj) {
		if(obj){
			obj.reminder = newData.reminder;
			lists.update({_id: obj._id}, obj, function(err, data){
				if(!err){
					callback(null, obj);
				} else {
					callback('nu s-a adaugat');
				}
			});			
		} else {
			callback('nu exista user');
		}
	});
}

exports.getGroups = function(userid, callback){
	var list = [];
	groups.find( {userid: userid}, function(err, cursor){
		cursor.each(function(err, obj){				
			if(obj){
				list.push(obj);	
			} else {
				callback(null, list);
			}
		});	
	});
}

exports.getListsP = function(data, callback){
	var list = [];
	lists.find( {userid: data.userid}, function(err, cursor){
		cursor.each(function(err, obj){				
			if(obj){
				if(obj.priority){
					if(obj.priority == data.priority){
						list.push(obj);
					}	
				}
			} else {
				callback(null, list);
			}
		});	
	});
}

exports.getLists = function(groupid, callback){
	var list = [];
	lists.find( {group: groupid}, function(err, cursor){
		cursor.each(function(err, obj){				
			if(obj){
				list.push(obj);	
			} else {
				callback(null, list);
			}
		});	
	});
}

exports.getListsReminder = function(callback){
	var list = [];
	lists.find(function(err, cursor){
		cursor.each(function(err, obj){				
			if(obj){
				if(obj.reminder){
					list.push(obj);
				}	
			} else {
				callback(null, list);
			}
		});	
	});
}

exports.editToDoName = function(newData, callback){
	lists.findOne({_id: ObjectId(newData.id)}, function(err,obj) {
		if(obj){
			obj.name = newData.name;
			lists.update({_id: obj._id}, obj, function(err, data){
				if(!err){
					callback(null, obj);
				} else {
					callback('nu s-a editat');
				}
			});			
		} else {
			callback('nu exista user');
		}
	});
}
