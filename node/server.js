global.amqp = require('amqp');
var io = require('socket.io').listen(40000);

/*
 * Module global variables
*/
global.amqpReady = 0;

var queueStack = new Object();

/*
   * RabbitMQ connection
*/

global.connection = global.amqp.createConnection({
    host: "localhost",
    port:5672,
    login: "guest",
    password: "guest"
});

global.connection.addListener('ready', 
    function () {
        console.log("RabbitMQ connection stablished");
        global.amqpReady = 1;
    }
    );


/*
             * Web-Socket declaration
             */ 

io.sockets.on('connection', function (socket) {
    socket.q =null;
    socket.exchange=null;
    routingKey=null;
    socket.on('message', function (data) {
        var data=JSON.parse(data);
		
        try{
                         
        }catch(error){
            socket.emit("message", JSON.stringify({
                "error": "invalid_params", 
                "code": 400
            }));
            var data = {};
        }           
        if(data!= undefined) {
            (function (data){
                console.log(data);
                try{                                
                    console.log("---- creating exchange");
                    socket.exchange = global.connection.exchange("com.es.topic", {
                        type:'topic',
                        durable:true
                    });
                    console.log("---- declare queue");
                    var timestamp=new Date().getTime();
                    if(data['view']=="tempQueue"){
                        queueName = data['userId']+''+timestamp;
                    }else{
                        queueName = data['customerId']+'.'+data['userId']+''+timestamp;
                    }
                    socket.q = global.connection.queue(queueName,{
                        durable:false,
                        exclusive:false,
                        autoDelete: true
                    },
                    function (){
							var counter=0;
                        if(data['view']=="tempQueue"){
                            routingKey=data['userId'];
                        }else if(data['view']=="profile"){ 
                            routingKey=data['customerId']+'.'+data['view']+'.'+data['channel']+'.'+data['profileId']+'.'+data['userId'];
                        }else{
                            routingKey=data['customerId']+'.'+data['view']+'.'+data['channel']+'.'+data['profileId']; 
                        }
                        console.log("---- bind queue to exchange");
                        socket.q.bind(socket.exchange, routingKey);
                        console.log("---- subscribing queue exchange");
                        socketObj=socket.q.subscribe(function (message) {
							socket.emit("message", message);
							});     
                        
                        socketObj.addCallback(function(ok) {
                            console.log(ok.consumerTag);
                            consumerTag=ok.consumerTag;
                            exchange=socket.exchange;
							rk=routingKey;
                            queueStack[consumerTag]=socket.q;
                            queueStack["exchange"+consumerTag]=socket.exchange;
							queueStack["rk"+consumerTag]=routingKey;
                            socket.emit("consumerTag",consumerTag);
                        });
                        
                        
                    }
                    );
                }catch(err){
                    console.log("Imposible to connection to rabbitMQ-server");
                }                                   

            })(data);          
        }
        else {
            socket.emit("message", JSON.stringify({
                "error": "invalid_token", 
                "code": 401
            }));
        }

    });
    
    socket.on('unsubscribe',function(consumerTag){
        
        if(consumerTag){
            var consumerTag=JSON.parse(consumerTag);
            if(socket.q!=null){
                console.log("View----->"+consumerTag['view']);
                console.log("temp----->"+consumerTag['temp']);
                if(consumerTag['view']){
                    var viewTag=consumerTag['view'];
                    if(queueStack.hasOwnProperty(viewTag)){
                        queue=queueStack[viewTag];
						rk=queueStack["rk"+viewTag];
						exchange=queueStack["exchange"+viewTag];
					     queue.unbind(exchange,rk);
						 queue.unsubscribe(viewTag);
						  delete queueStack[viewTag];
	                        delete queueStack["rk"+viewTag];
	                        delete queueStack["exchange"+viewTag];
						console.log('view consumerTag unsubscribe-------------------------------------->'+viewTag);
                    }
                }
                if(consumerTag['temp']){
                    var tempTag=consumerTag['temp'];
                    if(queueStack.hasOwnProperty(tempTag)){
                        queue=queueStack[tempTag];
						rk=queueStack["rk"+tempTag];
						exchange=queueStack["exchange"+tempTag];
						queue.unbind(exchange,rk);
                        queue.unsubscribe(tempTag);
                        delete queueStack[tempTag];
                        delete queueStack["rk"+tempTag];
                        delete queueStack["exchange"+tempTag];
						console.log('temp consumerTag unsubscribe-------------------------------------->'+tempTag);
                    }
                }
                if(consumerTag['profile']){
                    var profileTag=consumerTag['profile'];
                    if(queueStack.hasOwnProperty(profileTag)){
                        queue=queueStack[profileTag];
						rk=queueStack["rk"+profileTag];
						exchange=queueStack["exchange"+profileTag];
						queue.unbind(exchange,rk);
                        queue.unsubscribe(profileTag);
                        delete queueStack[profileTag];
                        delete queueStack["rk"+profileTag];
                        delete queueStack["exchange"+profileTag];
                        console.log('profile consumerTag unsubscribe-------------------------------------->'+profileTag);
                    }
                }
            }
        }
    });
    
    socket.on('disconnect', function () {
        console.log("closing socket");
    });
});


