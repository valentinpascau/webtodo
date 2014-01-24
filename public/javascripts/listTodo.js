$(document).ready(function() {
	var socket = io.connect('http://localhost/');
	var socket_home = io.connect('http://localhost/home');
	var upLi, downLi, numeList, inputTask, menus, valueOfTexarea, editTask, note, curentTextArea, urrentIdTodo, c, ntac, continut, cont;
	var edit = 'Edit';
	var prio = 'Priority:';
	var remi = 'Reminders';
	var del =  'Delete';
	var notes = 'Add Notes';
	var currentId = null;
	var reminder = '<input type="text" class="input-small datepicker remindDate" placeholder="remind me" readonly>';

    $(document).on('click','.todo-item .span8',function(){
        $(this).parent().find('.todo-dropdown').slideToggle();
    });

	socket_home.on('loadUserName', function(data){
		data = "Hello, "+data;
		$('#userName').text(data);
		console.log(data);
	});


	socket.on('groupNo', function(err, data){
		if(err){
			console.log("Lista deja exista in baza de date! Introduceti alt nume! ");
		}else{

		$('.list-items').prepend(
			$('<li>').attr({'class':'list-item', 'id':data._id}).append(
	    		$('<i>').attr('class', 'icon-list')).append(	
	    		$('<span>')
		));
		$('.list-items li:first span').text(data.listName);
		$('#appendedPrependedInput').val("");
		$('#appendedPrependedInput').focusout();

		// $('#input-list').replaceWith("<span id='addlist'>");
		// $('#addlist').text("Add new list");
		}

	});

	socket_home.on('groupNo', function(err, data){
		if(err){
			console.log("Lista deja exista in baza de date! Introduceti alt nume! ");
		}else{

		$('.list-items').prepend(
			$('<li>').attr({'class':'list-item', 'id':data._id}).append(
	    		$('<i>').attr('class', 'icon-list')).append(	
	    		$('<span>')
		));
		$('.list-items li:first span').text(data.listName);
		$('#appendedPrependedInput').val("");
		$('#appendedPrependedInput').focusout();

		// $('#input-list').replaceWith("<span id='addlist'>");
		// $('#addlist').text("Add new list");
		}

	});

		$('#appendedPrependedInput').blur(function() {
				numeList = $('#appendedPrependedInput').val();
				$('#appendedPrependedInput').focusout();

				socket_home.emit('newListGroup', {listName:numeList});

		});

		// $('#appendedPrependedInput').keypress(function(e) {
		// 	if(e.keyCode == 13){
		// 		console.log("enter");
		// 		numeList=0;
		// 		numeList = $('#appendedPrependedInput').val();
		// 		$('#appendedPrependedInput').focus();

		// 		socket_home.emit('newListGroup', {listName:numeList});
		// 	}
		// });
	$(document).on('click', '#removeList',function() {
   

   		$('.todo-item').each(function(){
   			$(this).remove();
   		});

    	socket_home.emit('deleteListGroup', {id:currentId});
	});

	socket.on('deletedGroupNo', function(err, id){
		if(err){
			console.log("Lista nu exista in baza de date! ");
		}else{
			$( ".list-item" ).each(function() {
				if($(this).attr('id')==id){
					$(this).remove();
					console.log("am intrat la stergere");
				}

			});
		}
	});

	socket_home.on('loadGroups', function(data){
		if(data.length==0){
			console.log(" nu exista in baza de date! ");
		}else{
			for(var i=0; i<data.length;i++) {
				$('.list-items').append(
					$('<li>').attr({'class':'list-item', 'id':data[i]._id}).append(
	    			$('<i>').attr('class', 'icon-list')).append(	
	    			"<span>"+data[i].listName)
				);
				}

		}
	});

	socket_home.on('loadLists', function(data){
		if(data.length==0){
			console.log(" nu exista  todo uri in baza de date! ");
		}else{
			for(var i=0; i<data.length;i++) {
				var todoIt = $('<div>').addClass("row-fluid todo-item").append(
				        $('<div>').addClass("row-fluid todo-item").attr("id",data[i]._id).append(
				        "<div class ='span1 "+data[i].priority+"'>").append(
				 		"<div class='span8'>"+data[i].name+"</div>").append(
				 		$('<div>').addClass("span2 dateArea").append(
				 			$('<input>').attr({'readonly':'readonly','type':'text','placeholder':'no due-date','value':data[i].date}).addClass("input-small datepicker todoDate pull-right").css({"margin-bottom":"0px","height":"30px","border":"0"}))).append(
				 		$('<div>').addClass("btn-group optionTask pull-right").append(
				 			$('<a>').addClass("btn dropdown-toggle").attr({'data-toggle':'dropdown', 'href':'#'}).append(
				 			$('<span>').addClass("caret"))).append(
				 			$('<ul>').addClass("dropdown-menu").append(
				 				$('<li>').append(
				 					"<a href='#' id='editT'>"+edit+"</a>","<a href='#'></a>","<a href='#' id='addNotes'>"+notes+"</a>").append(
				 						"<div class='pColor colorHead' id='p1'>"+1+"</div>").append(
										"<div class='pColor' id='p2'>"+2+"</div>").append(
										"<div class='pColor' id='p3'>"+3+"</div>").append(
										"<div class='pColor' id='p4'>"+"&#x2713;"+"</div>").append(
				 					"<a href='#' id='delitus'>"+del+"</a>")))).append(
				 		$('<div>').addClass("todo-dropdown").attr("id","notesArea").text(data[i].note).append(
					 		$('<div>').attr('class','row-fluid').append(
					 			$('<span>').addClass("reminderWrapper pull-right").append(
					 				$('<input>').addClass("input-small datepicker remindDate").attr({'readonly':'readonly','type':'text', 'placeholder':'remind me', 'value':data[i].reminder}))))));
				$(".offset2 div:eq(0)").after(todoIt.html());  
			}
		}
	});

	socket.on('settedNote', function(err, data){
		if(err){
			console.log("nota nu exista in baza de date! ");
		}else{
			$( ".todo-item" ).each(function() {
				if($(this).attr('id')==data._id){
					$(this).find('.todo-dropdown').replaceWith("<div class='todo-dropdown' id='notesArea'>"+data.note+   "<div class='row-fluid'>"+
								"<span class='reminderWrapper pull-right'>"+
							    "<input type='text' readonly class='input-small datepicker remindDate' placeholder='remind me' value="+data.reminder+">"+       "</span></div></div>");


				}

			});
		}
	});

		socket.on('editedToDoName', function(err, data){
		if(err){
			conslole.log("editare nu exista in baza de date! "+err);

		}else{
			$( ".todo-item" ).each(function() {
				if($(this).attr('id')==data._id){
					$(this).find('.span8').replaceWith("<div class='span8'>"+data.name+"</div>");
					

				}

			});
		}
	});

	socket.on('deletedToDo', function(err, id){
		if(err){
			console.log("todo nu exista in baza de date! ");
		}else{
			$( ".todo-item" ).each(function() {
				if($(this).attr('id')==id){
					$(this).remove();
				}

			});
		}
	});

	socket.on('settedDate', function(err, data){
		if(err){
			console.log("data  nu exista in baza de date! ");
		}else{
			$( ".todo-item" ).each(function() {
				if($(this).attr('id')==data._id){
					$(this).find('.span2 .datepicker').val(data.date);
				}

			});
		}
	});

	socket.on('settedReminder', function(err, data){
		if(err){
			console.log("data reminder nu exista in baza de date! ");
		}else{
			$( ".todo-item" ).each(function() {
				if($(this).attr('id')==data._id){
					$(this).find('.todo-dropdown .row-fluid .reminderWrapper .remindDate').val(data.reminder);
				}

			});
		}
	});

	socket.on('settedPriority', function(err, data){
		if(err){
			console.log("err nu exista in baza de date! "+err);
		}else{
			$( ".todo-item" ).each(function() {
				if($(this).attr('id')==data._id){
					if(data.priority=="priority-high"){
						$(this).find(".span1").addClass("priority-high");
						$(this).find(".span1").removeClass("priority-low");
						$(this).find(".span1").removeClass("priority-medium");
						$(this).find(".span1").removeClass("priority-done");
					}else if(data.priority=="priority-medium"){
						$(this).find(".span1").addClass("priority-medium");
						$(this).find(".span1").removeClass("priority-low");
						$(this).find(".span1").removeClass("priority-high");
						$(this).find(".span1").removeClass("priority-done");
					}else if(data.priority=="priority-low"){
						$(this).find(".span1").addClass("priority-low");
						$(this).find(".span1").removeClass("priority-high");
						$(this).find(".span1").removeClass("priority-medium");
						$(this).find(".span1").removeClass("priority-done");
					}else if(data.priority=="priority-done"){
						$(this).find(".span1").addClass("priority-done");
						$(this).find(".span1").removeClass("priority-high");
						$(this).find(".span1").removeClass("priority-medium");
						$(this).find(".span1").removeClass("priority-low");
					}
				}

			});
		}
	});

	$(document).on('click', '.list-item',function() {

		$( ".list-item-selected" ).each(function() {
	 		$('.list-item-selected').removeClass("list-item-selected");
		});
		$(this).addClass("list-item-selected");
		currentId = $(this).attr('id');
		
	});

	$('#addTodo').blur(function() {
		inputTask = $(this).val();
		socket_home.emit('newToDo', {name:inputTask, group:currentId});
		$('#addTodo').val("");

	});


	socket.on('ToDoNo', function(err, data){
		if(err){
			console.log("erorareeTODO"+err);
		}else{
			
			var todoIt = $('<div>').addClass("row-fluid todo-item").append(
				        $('<div>').addClass("row-fluid todo-item").attr("id",data._id).append(
				        $('<div>').addClass("span1")).append(
				 		"<div class='span8'>"+data.name+"</div>").append(
				 		$('<div>').addClass("span2 dateArea").append(
				 			$('<input readonly>').attr({'type':'text','placeholder':'no due-date'}).addClass("input-small todoDate datepicker pull-right").css({"margin-bottom":"0px","height":"30px","border":"0"}))).append(
				 		$('<div>').addClass("btn-group optionTask pull-right").append(
				 			$('<a>').addClass("btn dropdown-toggle").attr({'data-toggle':'dropdown', 'href':'#'}).append(
				 			$('<span>').addClass("caret"))).append(
				 			$('<ul>').addClass("dropdown-menu").append(
				 				$('<li>').append(
				 					"<a href='#' id='editT'>"+edit+"</a>","<a href='#' id='addNotes'>"+notes+"</a>").append(
				 						"<div class='pColor colorHead' id='p1'>"+1+"</div>").append(
										"<div class='pColor' id='p2'>"+2+"</div>").append(
										"<div class='pColor' id='p3'>"+3+"</div>").append(
										"<div class='pColor' id='p4'>"+"&#x2713;"+"</div>").append(
				 					"<a href='#' id='delitus'>"+del+"</a>")))).append(
				 		"<div class='todo-dropdown' id='notesArea'>"+
				 		"<div class='row-fluid'><span class='reminderWrapper pull-right' >"+reminder+"</span></div></div>"));
			$(".offset2 div:eq(0)").after(todoIt.html());     
			
		}
	});

	socket_home.on('ToDoNo', function(err, data){
		if(err){
			console.log("erorareeTODO"+err);
		}else{
			
			var todoIt = $('<div>').addClass("row-fluid todo-item").append(
				        $('<div>').addClass("row-fluid todo-item").attr("id",data._id).append(
				        $('<div>').addClass("span1")).append(
				 		"<div class='span8'>"+data.name+"</div>").append(
				 		$('<div>').addClass("span2 dateArea ").append(
				 			$('<input readonly>').attr({'type':'text','placeholder':'no due-date'}).addClass("input-small todoDate datepicker pull-right").css({"margin-bottom":"0px","height":"30px","border":"0"}))).append(
				 		$('<div>').addClass("btn-group optionTask pull-right").append(
				 			$('<a>').addClass("btn dropdown-toggle").attr({'data-toggle':'dropdown', 'href':'#'}).append(
				 			$('<span>').addClass("caret"))).append(
				 			$('<ul>').addClass("dropdown-menu").append(
				 				$('<li>').append(
				 					"<a href='#'>"+edit+"</a>","<a href='#'></a>","<a href='#' id='addNotes'>"+notes+"</a>").append(
				 						"<div class='pColor' id='p1'>"+1+"</div>").append(
										"<div class='pColor' id='p2'>"+2+"</div>").append(
										"<div class='pColor' id='p3'>"+3+"</div>").append(
										"<div class='pColor' id='p4'>"+"&#x2713;"+"</div>").append(
				 					"<a href='#' id='delitus'>"+del+"</a>")))).append(
				 		"<div class='todo-dropdown' id='notesArea'>"+
				 		"<div class='row-fluid'><span class='reminderWrapper pull-right'>"+reminder+"</span></div></div>"));
			$(".offset2 div:eq(0)").after(todoIt.html());     
			
		}
	});


	$(document).on('click', '#p1', function(){

		$(this).parents(".span1").addClass("priority-high");

	
	});
	$(document).on('click', '#p2', function(){

		$(this).parents(".span1").addClass("priority-medium");
		
	});

	$(document).on('click', '#p3', function(){

		$(this).parents(".span1").addClass("priority-low");
		
	});

	$(document).on('click', '#addNotes', function(){
	
		ntac =' ';
		$(this).parents('.todo-item').find('.todo-dropdown').slideToggle();
		ntac = $(this).parents('.todo-item').find('.todo-dropdown').text();
		$(this).parents('.todo-item').find('#notesArea').replaceWith("<textarea rows='4'class='area-text'>"+ntac+"</textarea>");

		$(this).parents('.todo-item').find('.area-text').focus();	
	});

	$(document).on('blur', '.area-text', function(){
		currentIdTodo = $(this).parent().attr('id');
		$(this).parent().find('.todo-dropdown').slideToggle();
		curentTextArea = $(this).parent().find('.area-text').val();
		socket_home.emit('setNote', {id:currentIdTodo,note:curentTextArea});
		$(this).replaceWith("<div class='todo-dropdown' id='notesArea'></textarea>");
	});

	$(document).on('click', '#delitus', function(){

		currentIdTodo = $(this).parents('.todo-item').attr('id');
		socket_home.emit('deleteToDo', {id:currentIdTodo});
	});

	$(document).on('click', '.pColor', function(){

		currentIdTodo = $(this).parents('.todo-item').attr('id');
		var color = $(this).attr('id');
			if(color=="p1"){
				socket_home.emit('setPriority', {id:currentIdTodo,priority:"priority-high"});
			}else if(color=="p2"){
				socket_home.emit('setPriority', {id:currentIdTodo,priority:"priority-medium"});
			}else if(color=="p3"){
				socket_home.emit('setPriority', {id:currentIdTodo,priority:"priority-low"});
			}else if(color=="p4"){
				socket_home.emit('setPriority', {id:currentIdTodo,priority:"priority-done"});
			}
	});
		$(document).on('blur', '.todoDate', function(){
		currentIdTodo = $(this).parents('.todo-item').attr('id');
			var data = $(this).val();
			socket_home.emit('setDate', {id:currentIdTodo, date:data});
	});

		$(document).on('blur', '.remindDate', function(){
		currentIdTodo = $(this).parents('.todo-item').attr('id');
		var data = $(this).val();
		socket_home.emit('setReminder', {id:currentIdTodo, reminder:data});
	});

	$(document).on('click', '#editT', function(){
		currentIdTodo = $(this).parents('.todo-item').attr('id');
		continut = $(this).parents('.todo-item').find('.span8').text();
		$(this).parent().parent().parent().parent().find('.span8').text("").append("<input class='span7' id='input-editname' style='margin-bottom:0;' type='text'></input>");
		$(this).parents('.todo-item').find('#input-editname').val(continut);
		$(this).parents('.todo-item').find('#input-editname').focus();
	});

	$(document).on('blur', '#input-editname', function(){
		currentIdTodo = $(this).parents('.todo-item').attr('id');
		cont = $(this).val();
		$(this).remove();
		socket_home.emit('editToDoName', {id:currentIdTodo, name:cont});
	});

	$(document).on('click', '.list-item', function(){
		var idlista = $(this).attr('id');
		socket_home.emit('getToDos', {id:idlista});
		$( ".todo-item" ).each(function() {
				$(this).remove();

		});

	});
	$(document).on('click', '.sort', function(){
		console.log("am intrat");
		console.log($(this).text());
		if($(this).text()=="High"){
			$( ".todo-item" ).each(function() {
				if($(this).find('.span1').attr('class').split(' ')[1]!="priority-high"){
					$(this).hide();
				}else{
					$(this).show();
				}

			});
		}else if($(this).text()=="All"){
			$( ".todo-item" ).each(function() {
					$(this).show();
			});
		}else if($(this).text()=="Medium"){
			$( ".todo-item" ).each(function() {
				if($(this).find('.span1').attr('class').split(' ')[1]!="priority-medium"){
					$(this).hide();
				}else{
					$(this).show();
				}


			});
		}else if($(this).text()=="Low"){
			$( ".todo-item" ).each(function() {
				if($(this).find('.span1').attr('class').split(' ')[1]!="priority-low"){
					$(this).hide();
				}else{
					$(this).show();
				}


			});
		}else if($(this).text()=="Done"){
			$( ".todo-item" ).each(function() {
				if($(this).find('.span1').attr('class').split(' ')[1]!="priority-done"){
					$(this).hide();
				}else{
					$(this).show();
				}


			});
		}

	});
	
	$(document).on('click', '#p4', function(){

	var	ultim = $(this).parents('.todo-item').find('.span8').text();
		$.pnotify.defaults.history = false;
		$.pnotify({	title: 'ToDo done!',
					text: 'You have completed the following task: '+ultim,
					type: 'success',
					hide: false
		});
	});				
	



	// menus=$('<div>').attr('class','menu').append(
	// 		$('<div>').attr('class','trmenu')).append(
	// 		$('<ul>').attr('id','ulMenu').append(
	// 			"<li class='menuIt' id='edit'>"+edit+"</li>").append(
	// 			$('<li>').attr('class','separator')).append(
	// 			"<li class='menuIt' id='note'>"+note+"</li>").append(
	// 			$('<li>').attr('class','separator')).append(
	// 			$('<li>').attr({'class':'menuIt', 'id':'priorLiId'}).append(
	// 				"<p class='qwerty'>"+prio+"</p>").append( 
	// 				$('<div>').attr('class','prior').append(
	// 					"<div class='pColor' id='p1'>"+p1+"</div>").append(
	// 					"<div class='pColor' id='p2'>"+p2+"</div>").append(
	// 					"<div class='pColor' id='p3'>"+p3+"</div>").append(
	// 					"<div class='pColor' id='p4'>"+p4+"</div>")
	// 				)
	// 			).append(
	// 			$('<li>').attr('class','separator')).append(
	// 			"<li class='menuIt' id='reminder'>"+remi+"</li>").append(
	// 			$('<li>').attr('class','separator')).append(
	// 			"<li class='menuIt' id='delet'>"+del+"</li>")


//data

	$(document).on('focus','.datepicker', function(){
		var nowTemp = new Date();
		var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
	
 		$( ".datepicker" ).datepicker({ format : 'dd-mm-yyyy',
    		onRender: function(date) {
      			return date.valueOf() < now.valueOf() ? 'disabled' : '';
    		}
  		}).data('datepicker');
 	});


$('#forgotbox').click(function(){

    $(function() {
      $( "#dialog" ).dialog({
        height: 170,
        modal: true
      });
    });

  });


// sort

// 	$(function() {	
// 		$( "#ulList" ).sortable({items: '> li:not(#watch-li)'});
// 		$( "#ulList" ).disableSelection();
// 	});


//drag and drop

	// $(function() {
	//     $( '#ul-task' ).sortable();
	//     $( '#ulList' ).droppable({
	//       	drop: function( event, ui ) {
	// 	        $( this ).addClass( "ui-state-highlight" ).find( "span" ).html( "Dropped!" );
	//       }
	//     });
	// });

});