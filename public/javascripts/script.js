$(document).ready(function() {
  // $('#newuserid').val(" ");
  // $('#newemail').val(" ");
  // $('#newpass').val(" ");


  var socketLogin = io.connect('http://localhost/login');

  socketLogin.on('userNo', function(data){
    if(data.no==0){
      $('#checkOk1').show();
      $('#checkX1').hide();

    }else{
      $('#checkX1').show();
    } 
    console.log("sa emis: " + data.no);
  });     

  socketLogin.on('emailNo', function(data){
    if(data.no==0){
      $('#checkOk2').show();
      $('#checkX2').hide();
    }else{
      $('#checkX2').show();
    }
      console.log("sa emis: " + data.no);
  });
  socketLogin.on('passNo', function(data){
    if(data.no==0){
      $('#checkOk3').show();
      $('#checkX3').hide();
    }else{
      $('#checkX3').show();
    }
      console.log("sa emis: " + data.no);
  });
    
  $('#newuserid').blur(function() {
    var newuserid = $('#newuserid').val(); console.log(newuserid);
    socketLogin.emit('newSignupUser', {newuserid:newuserid});
  });

  $('#newemail').blur(function() {
    var newemail = $('#newemail').val();
    socketLogin.emit('newSignupEmail', {newEmail:newemail});
  });
  $('#newpass').blur(function() {
    var newpass = $('#newpass').val();
    socketLogin.emit('newSignupPass', {newPass:newpass});
  });

  $('#forgotbox').click(function(){

    $(function() {
      $( "#dialog-modal" ).dialog({
        height: 140,
        modal: true
      });
    });

  });

});