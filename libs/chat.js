const socketio = require("socket.io");
const mongoose = require("mongoose");
const events = require("events");
const _ = require("lodash");
const shortid = require("shortid");
const eventEmitter = new events.EventEmitter();

//adding db models
require("../app/models/user.js");
require("../app/models/chat.js");
require("../app/models/room.js");
require("../app/models/agent.js");
require("../app/models/visitor.js");

//using mongoose Schema models
const userModel = mongoose.model("User");
const chatModel = mongoose.model("Chat");
const roomModel = mongoose.model("Room");
const agentModel = mongoose.model("agent");
const visitorModel = mongoose.model("visitor");

//reatime magic begins here
module.exports.sockets = function(http) {
  io = socketio.listen(http);

  //setting chat route
  const ioChat = io.of("/chat");
  const userStack = {};
  const visitorStack = {};
  let oldChats, sendUserStack, setRoom , sendVisitorStack;
  const userSocket = {};
  const visitorSocket = {};

  var allClients = [];

  //socket.io magic starts here
  ioChat.on("connection", function(socket) {
    console.log("socketio chat connected.");
    allClients.push(socket);

    //function to get user name
    socket.on("set-user-data", function(username) {
      console.log(username + "  logged In");

      //storing variable.
      socket.username = username;
      userSocket[socket.username] = socket.id;
      visitorSocket[socket.username] = socket.id;

      socket.broadcast.emit("broadcast", {
        description: username + " Logged In"
      });

      //getting all users list
      eventEmitter.emit("get-all-visitors");

      //sending all users list. and setting if online or offline.
      sendVisitorStack = function() {
        for (i in visitorSocket) {
          for (j in visitorStack) {
            if (j == i) {
              visitorStack[j] = "Online";
            }
          }
        }
        //for popping connection message.
        ioChat.emit("onlineStack", visitorStack);
      }; //end of sendUserStack function.
    }); //end of set-user-data event.

  

  socket.on("get_visitor_id", function(visit_name, callback) {

    visitorModel.findOne(
           { $and: [{ visitor_name: visit_name }] },
           function(err, result) {
            
            var countryVal2 = "US";
            // console.log(result.visitor_region_privateIp);
            // if(result.visitor_region_privateIp.length != 0)
            // {
            //   console.log('1');
            //   countryVal2 = result.visitor_region_privateIp[0].country;
            // }
            // else if(result.visitor_region_publicIp.length != 0)
            // {
            //   console.log('2');
            //   countryVal2 = result.visitor_region_publicIp[0].country;
            // }
            
            var countryVal =  countryVal2;
            var browserVal = result.visitor_browser_and_os[0].browser;
            var osVal = result.visitor_browser_and_os[0].os;
            var platformVal = result.visitor_browser_and_os[0].platform;


            if(err){
              visitId =  "";
              agent_name = "";

              response = { visitor_id: visitId , visitor_name : visit_name , agent_name : agent_name,
                country: countryVal,
                browser: browserVal,
                os: osVal,
                platform: platformVal
              }

              callback(response);
            }

            if(result!=null){
             
            visitId = result.visitor_id;

             if(visitId == ""){
              visitId =  "";
              agent_name = "";

              response = { visitor_id: visitId , visitor_name : visit_name , agent_name : agent_name,
                country: countryVal,
                browser: browserVal,
                os: osVal,
                platform: platformVal
              }

              callback(response);
              
             }else{
              visitId =  visitId;

              roomModel.findOne(
                { $and: [{ name1 : visitId}] },
                function(err, res){

                  if(err){
                    visitId = visitId;
                    agent_name = "";
                    response = { visitor_id: visitId , visitor_name : visit_name , agent_name : agent_name,
                      country: countryVal,
                      browser: browserVal,
                      os: osVal,
                      platform: platformVal
                    }

                      callback(response);
                  }

                  if(res!=null){

                  if(res.name2 == ""){
                    visitId = visitId;
                    agent_name = "";
                    response = { visitor_id: visitId , visitor_name : visit_name , agent_name : agent_name,
                      country: countryVal,
                      browser: browserVal,
                      os: osVal,
                      platform: platformVal
                    }

                      callback(response);

                  }else{

                  visitId = visitId;
                  agentModel.findOne(
                    { $and: [{ agent_id : res.name2}] },
                    function(err, resp){
  
                     response = { visitor_id: res.name1 , visitor_name : visit_name , agent_name : resp.agent_name,
                      country: countryVal,
                      browser: browserVal,
                      os: osVal,
                      platform: platformVal
                    }

                      callback(response);

  
                    }
                  )

                  }
                }
                }
              )

              }
            }
              
          
           }
         );
  });

  socket.on("get_reply_msg", function( msgId , callback) {

     // console.log(msgId);

    //if(repId != ""){
     

      chatModel.findOne(
        { $and: [{ msgId : msgId}] },
        function(err, dat){

        //  console.log(dat.msgId + ' - ' + repId);

          var msg = dat.msg;
          var msgId = dat.msgId;
          var msgFrom = dat.msgFrom;
          var msgTo = dat.msgTo;
          var file = dat.file;
          var createdOn = dat.createdOn;

          if(dat.repMsgId == ""){

            response = {  repId: dat.repMsgId, 
              msgId: msgId , 
              msgFrom : ""  , 
              msgTo : "",
              msg : "", 
              file : "", 
              createdOn : "",
              repmsgFrom :msgFrom  , 
              repmsgTo : msgTo,
              repmsg : msg, 
              repfile : file, 
              repcreatedOn : createdOn
            }

            callback(response);

          }else{

          chatModel.findOne(
            {$and: [{ msgId : dat.repMsgId}]},function(err, res){

              response = {  repId: dat.repMsgId, 
                msgId: msgId , 
                msgFrom : msgFrom  , 
                msgTo : msgTo,
                msg : msg, 
                file : file, 
                createdOn : createdOn,
                repmsgFrom : res.msgFrom  , 
                repmsgTo : res.msgTo,
                repmsg : res.msg, 
                repfile : res.file, 
                repcreatedOn : res.createdOn
              }

              callback(response);
   

            }
          )

          }

        }
      )

    // }else{
    //   console.log("2");
    //   chatModel.findOne(
    //     { $and: [{ msgId : msgId}] },
    //     function(err, res){
 
    //         response = {  repId: "", msgId: msgId ,  msgFrom : res.msgFrom  , msgTo : res.msgTo, msg : res.msg, file : res.file, room : res.room, createdOn : res.createdOn}
 
    //           callback(response);
    //     }
    //   )

    // }



    
  });


    //setting room.
    socket.on("set-room", function(room) {
      //leaving room.
      socket.leave(socket.room);
      //getting room data.
      eventEmitter.emit("get-room-data", room);
      //setting room and join.
      setRoom = function(roomId) {
        socket.room = roomId;
        socket.join(socket.room);
        ioChat.to(userSocket[socket.username]).emit("set-room", socket.room);
      };
    }); //end of set-room event.

    socket.on("update-room", function(room) {
      
      const filter = { name1: room.visitor_id };
      const update = { name2: room.agent_id };

      roomModel.findOne({ name1: room.visitor_id }, function(err,obj) { 

        if(err){

          socket.room =  obj._id;
          socket.join(socket.room);
          ioChat.to(userSocket[socket.username]).emit("update-room", socket.room);

        }
        if(obj!=null){
        if(obj.name2 == ""){
          roomModel.findOneAndUpdate(
            filter , update , function(err, result) {
            socket.room = result._id;
            chatModel.updateMany({ room : socket.room } , {$set: { msgTo: room.agent }} , function(err, result) { }  )
              socket.room = result._id;
              socket.join(socket.room);
              ioChat.to(userSocket[socket.username]).emit("update-room", socket.room);
          }
        );
        }else{
            socket.room =  obj._id;
            socket.join(socket.room);
            ioChat.to(userSocket[socket.username]).emit("update-room", socket.room);
        }
      } 
      });




    }); //end of set-room event.

    //emits event to read old-chats-init from database.
    socket.on("old-chats-init", function(data) {
      eventEmitter.emit("read-chat", data);
    });

    //emits event to read old chats from database.
    socket.on("old-chats", function(data) {
      eventEmitter.emit("read-chat", data);
    });

    //sending old chats to client.
    oldChats = function(result, username, room) {
      ioChat.to(userSocket[username]).emit("old-chats", {
        result: result,
        room: room
      });
    };

    //showing msg on typing.
    socket.on("typing", function() {
      socket
        .to(socket.room)
        .broadcast.emit("typing", socket.username + " : is typing...");
    });

    //for showing chats.
    socket.on("chat-msg", function(data) {

      const id = shortid.generate();
      //emits event to save chat to database.
      eventEmitter.emit("save-chat", {
        msgFrom: socket.username,
        msgTo: data.msgTo,
        msg: data.msg,
        file : data.file,
        room: socket.room,
        type: data.type,
        id: id,
        repMsgId: data.repMsgId,
        date: data.date
      });
      
      //emits event to send chat msg to all clients.

       if(data.repMsgId != ""){
        chatModel.findOne(
          { $and: [{ msgId : data.repMsgId}] },
          function(err, res){

            ioChat.to(socket.room).emit("chat-msg", {
              msgFrom: socket.username,
              file: data.file,
              msg: data.msg,
              id: id,
              date: data.date,
              repFrom : res.msgFrom,
              repTo : res.msgTo,
              repMsg : res.msg,
              repfile: res.file,
              repDate: res.createdOn,
            });
            
          }
        )
       }else{
         ioChat.to(socket.room).emit("chat-msg", {
           msgFrom: socket.username,
           file: data.file,
           msg: data.msg,
           id: id,
           date: data.date,
           repMsg : ""
         });
       }
       
    });

    //for popping disconnection message.
    socket.on("disconnect", function() {

      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
      
      console.log(socket.username + "  logged out");
      socket.broadcast.emit("broadcast", {
        description: socket.username + " Logged out"
      });

      console.log("chat disconnected.");

      _.unset(userSocket, socket.username);
      userStack[socket.username] = "Offline";

     // ioChat.emit("onlineStack", userStack);
    }); //end of disconnect event.
  }); //end of io.on(connection).
  //end of socket.io code for chat feature.

  //database operations are kept outside of socket.io code.
  //saving chats to database.
  eventEmitter.on("save-chat", function(data) {
    // var today = Date.now();

    if(data.type=="agent"){
     var newChat = new chatModel({
       msgFrom: data.msgFrom,
       msgTo: data.msgTo,
       msg: data.msg,
       file: data.file,
       repMsgId : data.repMsgId,
       room: data.room,
       msgId:data.id,
       createdOn: data.date
     });

     newChat.save(function(err, result) {
      if (err) {
        console.log("Error : " + err);
      } else if (result == undefined || result == null || result == "") {
        console.log("Chat Is Not Saved.");
      } else {
        console.log("Chat Saved.");
      }
    });

    }else{
      roomModel.findOne({ _id: data.room }, function(err,obj) { 
        
        agent_id = obj.name2;

        if(agent_id == ""){

          var newChat = new chatModel({
            msgFrom: data.msgFrom,
            msgTo: data.msgTo,
            msg: data.msg,
            repMsgId : data.repMsgId,
            file: data.file,
            msgId:data.id,
            room: data.room,
            createdOn: data.date
          });

          newChat.save(function(err, result) {
            if (err) {
              console.log("Error : " + err);
            } else if (result == undefined || result == null || result == "") {
              console.log("Chat Is Not Saved.");
            } else {
              console.log("Chat Saved.");
            }
         

        });

        }else{

          agentModel.findOne({ agent_id: agent_id } , function(err,res){
            var newChat = new chatModel({
              msgFrom: data.msgFrom,
              msgTo: res.agent_name,
              msgId:data.id,
              msg: data.msg,
              repMsgId : data.repMsgId,
              file: data.file,
              room: data.room,
              createdOn: data.date
            });

            newChat.save(function(err, result) {
              if (err) {
                console.log("Error : " + err);
              } else if (result == undefined || result == null || result == "") {
                console.log("Chat Is Not Saved.");
              } else {
                console.log("Chat Saved.");
              }
           
  
          });

          });

        }



          
      
      });

    }

   
  }); //end of saving chat.

  //reading chat from database.
  eventEmitter.on("read-chat", function(data) {
    chatModel
      .find({})
      .where("room")
      .equals(data.room)
      .sort("-createdOn")
      .skip(data.msgCount)
      .lean()
     // .limit(5)
      .exec(function(err, result) {
        if (err) {
          console.log("Error : " + err);
        } else {
          //calling function which emits event to client to show chats.
          oldChats(result, data.username, data.room);
        }
      });
  }); //end of reading chat from database.


    //listening for get-all-users event. creating list of all users.
    eventEmitter.on("get-all-visitors", function() {
      visitorModel
        .find({})
        .select("visitor_name")
        .select("visitor_id")
        .exec(function(err, result) {
          if (err) {
            console.log("Error : " + err);
          } else {
            //console.log(result);
            for (var i = 0; i < result.length; i++) {
              visitorStack[result[i].visitor_name] = "Offline";
            }
            sendVisitorStack();
          }
        });
    }); //end of get-all-users event.


  //listening get-room-data event.
  eventEmitter.on("get-room-data", function(room) {
    roomModel.find(
      {
        $or: [
          {
            name1: room.name1
          },
          {
            name1: room.name2
          },
          {
            name2: room.name1
          },
          {
            name2: room.name2
          }
        ]
      },
      function(err, result) {
        if (err) {
          console.log("Error : " + err);
        } else {
          if (result == "" || result == undefined || result == null) {
            var today = Date.now();

            newRoom = new roomModel({
              name1: room.name1,
              name2: room.name2,
              lastActive: today,
              createdOn: today
            });

            newRoom.save(function(err, newResult) {
              if (err) {
                console.log("Error : " + err);
              } else if (
                newResult == "" ||
                newResult == undefined ||
                newResult == null
              ) {
                console.log("Some Error Occured During Room Creation.");
              } else {
                setRoom(newResult._id); //calling setRoom function.
              }
            }); //end of saving room.
          } else {
            var jresult = JSON.parse(JSON.stringify(result));
            setRoom(jresult[0]._id); //calling setRoom function.
          }
        } //end of else.
      }
    ); //end of find room.
  }); //end of get-room-data listener.
  //end of database operations for chat feature.

  //
  //

  //to verify for unique username and email at signup.
  //socket namespace for signup.
  const ioSignup = io.of("/signup");

  let checkUname, checkEmail; //declaring variables for function.

  ioSignup.on("connection", function(socket) {
    console.log("signup connected.");

    //verifying unique username.
    socket.on("checkUname", function(uname) {
      eventEmitter.emit("findUsername", uname); //event to perform database operation.
    }); //end of checkUname event.

    //function to emit event for checkUname.
    checkUname = function(data) {
      ioSignup.to(socket.id).emit("checkUname", data); //data can have only 1 or 0 value.
    }; //end of checkUsername function.

    //verifying unique email.
    socket.on("checkEmail", function(email) {
      eventEmitter.emit("findEmail", email); //event to perform database operation.
    }); //end of checkEmail event.

        //verifying unique email.
    socket.on("checkAgentEmail", function(email) {
      eventEmitter.emit("findAgentEmail", email); //event to perform database operation.
    }); //end of checkEmail event.

    //function to emit event for checkEmail.
    checkEmail = function(data) {
      ioSignup.to(socket.id).emit("checkEmail", data); //data can have only 1 or 0 value.
    }; //end of checkEmail function.

        //function to emit event for checkEmail.
        checkAgentEmail = function(data) {
          ioSignup.to(socket.id).emit("checkAgentEmail", data); //data can have only 1 or 0 value.
        }; //end of checkEmail function.

    //on disconnection.
    socket.on("disconnect", function() {
      console.log("signup disconnected.");
    });
  }); //end of ioSignup connection event.

  const ioAgent = io.of("/agent");

  let checkAgentEmail; //declaring variables for function.

  ioAgent.on("connection", function(socket) {
    console.log("Agent connected.");

        //verifying unique email.
    socket.on("checkAgentEmail", function(email) {
      eventEmitter.emit("findAgentEmail", email); //event to perform database operation.
    }); //end of checkEmail event.


        //function to emit event for checkEmail.
        checkAgentEmail = function(data) {
          ioAgent.to(socket.id).emit("checkAgentEmail", data); //data can have only 1 or 0 value.
        }; //end of checkEmail function.

    //on disconnection.
    socket.on("disconnect", function() {
      console.log("signup disconnected.");
    });
  }); //end of ioSignup connection event.

  //database operations are kept outside of socket.io code.
  //event to find and check username.
  eventEmitter.on("findUsername", function(uname) {
    userModel.find(
      {
        username: uname
      },
      function(err, result) {
        if (err) {
          console.log("Error : " + err);
        } else {
          //console.log(result);
          if (result == "") {
            checkUname(1); //send 1 if username not found.
          } else {
            checkUname(0); //send 0 if username found.
          }
        }
      }
    );
  }); //end of findUsername event.

  //event to find and check username.
  eventEmitter.on("findEmail", function(email) {
    userModel.find(
      {
        email: email
      },
      function(err, result) {
        if (err) {
          console.log("Error : " + err);
        } else {
          //console.log(result);
          if (result == "") {
            checkEmail(1); //send 1 if email not found.
          } else {
            checkEmail(0); //send 0 if email found.
          }
        }
      }
    );
  }); //end of findUsername event.

    //event to find and check username.
    eventEmitter.on("findAgentEmail", function(agent_email) {
      agentModel.find(
        {
          agent_email: agent_email
        },
        function(err, result) {
          if (err) {
            console.log("Error : " + err);
          } else {
            //console.log(result);
            if (result == "") {
              checkAgentEmail(1); //send 1 if email not found.
            } else {
              checkAgentEmail(0); //send 0 if email found.
            }
          }
        }
      );
    }); //end of findUsername event.

  //
  //

  return io;
};
