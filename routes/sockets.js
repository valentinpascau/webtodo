var AM = require('./accountManager');
var check = require('validator').check;
var cookie = require("cookie"); 


module.exports = function(io) {

	io.of('/login').on('connection', function (socket) {

	    socket.on('newSignupUser', function (data) {
	    	try {
			    check(data.newuserid).notNull().len(2, 64);
			    AM.verifyUserName(data.newuserid, function(no){
		    		socket.emit('userNo', {no:no});
		    	});	
			} catch (e) {
			    socket.emit('userNo',{no:1});
			}				    
	    });

	    socket.on('newSignupEmail', function (data) {
	    	try {
			    check(data.newEmail).notNull().len(6, 64).isEmail();
			    AM.verifyEmail(data.newEmail, function(no){
		    		socket.emit('emailNo',{no:no});
		    	}); 
			} catch (e) {
			    socket.emit('emailNo',{no:1});
			}  		
	    });

	    socket.on('newSignupPass', function (data) {
	    	try {
			    check(data.newPass).notNull().len(6, 64);
		    	socket.emit('passNo',{no:0}); 
			} catch (e) {
			    socket.emit('passNo',{no:1});
			}  		
	    });

	});



	io.of('/home').on('connection', function (socket) {

		var room = "";
        getCookie(cookie.parse(socket.handshake.headers.cookie)["connect.sess"], function(cookie){
    			room = cookie;
    			//socket.join('"'+cookie+'"');
    	});

		socket.join(room);




		AM.getUserName(room, function(err, username){
			if(!err){
				//console.log(room);
				socket.emit('loadUserName', username);
			}
		});


		AM.getGroups(room, function (err, list){
			if(!err){
				socket.emit('loadGroups', list);
			}
		});
		

		socket.on('getToDos', function (data){

			AM.getLists(data.id, function(err, list){
				if(!err){
					socket.emit('loadLists', list);
				}
			});
		});






	    socket.on('newListGroup', function (data) {
    		var cook = socket.handshake.headers.cookie;

    		getCookie(cookie.parse(cook)["connect.sess"], function(cookie){
    			//console.log(cookie);
    			data.userid = cookie;
    			//console.log(io.sockets.clients('home/' + room));
    		});

    		if(data.listName){
		    	AM.addListGroup(data, function (err, obj){
		    		if(err){
		    			socket.emit('groupNo', err);	
		    		} else {
		    			io.sockets.in('home/' + room).emit('groupNo', null, obj);
		    		}	    		
		    	});
	    	}				    
	    });

	    socket.on('deleteListGroup', function (data) {
    		
	    	AM.deleteListGroup(data, function (err, obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('deletedGroupNo', err);	
	    		} else {
	    			io.sockets.in('home/' + room).emit('deletedGroupNo', null, obj);
	    		}	    		
	    	});				    
	    });

	    socket.on('newToDo', function (data) {

	        var cook = socket.handshake.headers.cookie;
    		getCookie(cookie.parse(cook)["connect.sess"], function(cookie){
    			data.userid = cookie;
    		});

    		if(data.name && data.group){
		    	AM.addToDo(data, function (err, obj){
		    		if(err){
		    			socket.emit('ToDoNo', err);	
		    		} else {
		    			io.sockets.in('home/' + room).emit('ToDoNo', null, obj);
		    		}	
		    	});		
	    	} 		
	    });

	    socket.on('deleteToDo', function (data) {
	        AM.deleteList(data, function (err, obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('deletedToDo', err);	
	    		} else {
	    			io.sockets.in('home/' + room).emit('deletedToDo', null, obj);
	    		}	    		
	    	});		 		
	    });

	    socket.on('groupSetOrder', function (data) {
	    	var cook = socket.handshake.headers.cookie;

    		getCookie(cookie.parse(cook)["connect.sess"], function(cookie){
    			//console.log(cookie);
    			data.userid = cookie;
    			//console.log(io.sockets.clients('home/' + room));
    		});
	        AM.groupSetOrder(data, function (err, obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('reorderGroups', err);	
	    		} else {
	    			io.sockets.in('home/' + room).emit('reorderGroups', null, obj);
	    		}	    		
	    	});		 		
	    });


	    socket.on('setPriority', function (data) {
	        AM.setPriority(data, function (err, obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('settedPriority', err);	
	    		} else {
	    			io.sockets.in('home/' + room).emit('settedPriority', null, obj);
	    		}	    		
	    	});		 		
	    });

	    socket.on('getNote', function (data){
	    	AM.getNote(data, function (err,obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('receiveNote', err);
	    		} else {
	    			io.sockets.in('home/' + room).emit('receiveNote', null, obj);
	    		}
	    	});
	    });

	    socket.on('setNote', function (data) {
	        AM.setNote(data, function (err, obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('settedNote', err);	
	    		} else {
	    			io.sockets.in('home/' + room).emit('settedNote', null, obj);
	    		}	    		
	    	});		 		
	    });

	    socket.on('setDate', function (data) {
	        AM.setdate(data, function (err, obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('settedDate', err);	
	    		} else {
	    			io.sockets.in('home/' + room).emit('settedDate', null, obj);
	    		}	    		
	    	});		 		
	    });

	    socket.on('setReminder', function (data) {
	        AM.setReminder(data, function (err, obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('settedReminder', err);	
	    		} else {
	    			io.sockets.in('home/' + room).emit('settedReminder', null, obj);
	    		}	    		
	    	});		 		
	    });

	    socket.on('editToDoName', function (data) {
	        AM.editToDoName(data, function (err, obj){
	    		if(err){
	    			io.sockets.in('home/' + room).emit('editedToDoName', err);	
	    		} else {
	    			io.sockets.in('home/' + room).emit('editedToDoName', null, obj);
	    		}	    		
	    	});		 		
	    });


	});

}



function getCookie(cookie, callback) {
    var cookJson = null;
    if (cookie){
        var startPos = 0;
        if(cookie.indexOf('"user"') != -1){
        	startPos = cookie.indexOf('"user"') + 7;

	        var stopPos = 0;

	        for (var i = startPos + 1;  i <= cookie.length - 1; i++) {
	            if (cookie[i] == '"'){
	                stopPos = i+1;
	                break;
	            }
	        }

        	cookJson = JSON.parse(cookie.substring(startPos,stopPos));
        }
    }
    callback(cookJson);
}