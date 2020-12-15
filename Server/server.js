const { default: Axios } = require('axios');
const express = require("express");
const app = express();
const server = require('http').createServer(app);
const axios = require('axios');
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
});
const {userJoin,getCurrentUser,userLeft,getAllPlayerForRoom,addPoint} = require("./utilis/user")
const user = require('./utilis/user');
var CronJob = require('cron').CronJob;
const cors = require('cors')
app.use(cors());
app.use(express.json())
    io.on('connection', socket => {
});

io.of("/Genre").on("connection",(socket)=>{
    
    socket.emit("Bienvenue","Pret a jouer des coudes");

    socket.on("disconnect",() =>{
        const user = userLeft(socket.id);
        if(user){
            socket.leave(user.room);
            io.of("/Genre").to(user.room).emit("suppUser", user.userName+"est partie de :"+user.room);
            io.of("/Genre").to(user.room).emit("roomInfo",{
                room: user.room,
                users: getAllPlayerForRoom(user.room)
            });
        }
    });

    socket.on("addPoint",(socket,point)=>{
        addPoint(socket.id,point);
    })

    socket.on("joinRoom", ({userName,room,playerImg}) =>{
        const user = userJoin(socket.id,userName,room,0,playerImg);
        socket.join(user.room);
        io.of("/Genre").to(user.room).emit("newUser", user.username+" est rentré dans :"+room+" faites lui une ovation");
        io.of("/Genre").to(user.room).emit("roomInfo",{
            room: user.room,
            users: getAllPlayerForRoom(user.room)
        });
        if(getAllPlayerForRoom(user.room).length > 1)
        {
            io.of("/Genre").to(user.room).emit('Waiting',user.username+" attendez la prochaine musique avant de pouvoir jouer");
        }else{
            launchGame(user);
        }
    });

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        io.of("/Genre").to(user.room).emit('message', {from : user.username,fromImg:user.img, message : msg,time});
    });

    socket.on('chatMessagePrivate', ({idReceiver,msg}) => {
        const user = getCurrentUser(socket.id);
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        socket.to(idReceiver).emit('privateMessage', {from : user.username,fromImg:user.img, message : msg,time}); 
    });

});

io.of("/Custom").on("connection",(socket)=>{
    
    socket.emit("Bienvenue","Pret a jouer des coudes");
    
    socket.on("disconnect",() =>{
        const user = userLeft(socket.id);
        if(user){
            socket.leave(user.room);
            io.of("/Custom").to(user.room).emit("suppUser", user.userName+"est partie de :"+user.room);
            io.of("/Custom").to(user.room).emit("roomInfo",{
                room: user.room,
                users: getAllPlayerForRoom(user.room)
            });
        }
    });

    socket.on("joinRoom", ({userName,room,playerImg}) =>{
        const user = userJoin(socket.id,userName,room,0,playerImg);
        socket.join(user.room);
        io.of("/Custom").to(user.room).emit("newUser", user.username+" est rentré dans :"+room+" faites lui une ovation");
        io.of("/Custom").to(user.room).emit("roomInfo",{
            room: user.room,
            users: getAllPlayerForRoom(user.room)
        });
        if(getAllPlayerForRoom(user.room).length > 1)
        {
            io.of("/Custom").to(user.room).emit('Waiting',user.username+" attendez la prochaine musique avant de pouvoir jouer");
        }
        if(getAllPlayerForRoom(user.room).length === 1)
        {
            io.of("/Custom").to(user.room).emit('Admin',true);
        }
    });

    socket.on("startGame",(socket,playlistId)=>{
        const user = getCurrentUser(socket.id)
        launchCustomGame(user,playlistId)
    })
    
    socket.on("addPoint",(socket,point)=>{
        addPoint(socket.id,point);
    })
    
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        io.of("/Custom").to(user.room).emit('message', {from : user.username,fromImg:user.img, message : msg,time});
    });
    
    socket.on('chatMessagePrivate', ({idReceiver,msg}) => {
        const user = getCurrentUser(socket.id);
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        socket.to(idReceiver).emit('privateMessage', {from : user.username,fromImg:user.img, message : msg,time}); 
    });

});

app.get('/genres', async function(req, res) {
    let tokenResponse;
    let catResponse;
    try{
        tokenResponse = await 
        axios('https://accounts.spotify.com/api/token',{ 
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic MjFlNWYxZjM3ZDg2NGJiOWJiNjA3YTg3NDhjYTQyYTc6OTkxN2RiNjE4ZjhkNDZmN2IyYWQyZjAzMTI5NmQyMzM='
            },
            data: 'grant_type=client_credentials',
            method:"POST"
        });
        catResponse = await
        axios("https://api.spotify.com/v1/browse/categories",{ 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+tokenResponse.data.access_token
            },
            method:"GET"
        })
        return res.status(200).send({
            statusCode: 200,
            data: catResponse.data.categories.items
        });
    }catch(error){
        console.log(error)
        return res.status(500).json({
            statusCode: 500,
            data: null
        });
    }   
});

server.listen(3000);

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function sendMusique(of,index,playlist,user){
    var playlistJob = new CronJob('*/30 * * * * *', ()=>{
        if(index >= playlist.length-1){
            playlistJob.stop();
            gameFinish(user,45);
        }  
        io.of('"'+of+'"').to(user.room).emit('playlist',playlist[index]);
        index++;
    }, null, true, 'Europe/Paris');
    playlistJob.start();  
}

function gameFinish(user,sec){
    var startGameJob = new CronJob('* * * * * *', ()=>{
        io.to(user.room).emit('gameRestart',"La partie va recommancer dans "+sec+" sec");
        sec--;
        if(sec <= 0){
            startGameJob.stop();
            launchGame(user)
        }   
    }, null, true, 'Europe/Paris');
    startGameJob.start(); 
}

function launchGame(user){
    axios('https://accounts.spotify.com/api/token',{ 
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Authorization' : 'Basic MjFlNWYxZjM3ZDg2NGJiOWJiNjA3YTg3NDhjYTQyYTc6OTkxN2RiNjE4ZjhkNDZmN2IyYWQyZjAzMTI5NmQyMzM='
        },
        data: 'grant_type=client_credentials',
        method:"POST"
     })
    .then(tokenResponse => {
        axios("https://api.spotify.com/v1/browse/categories/"+user.room+"/playlists?country=FR&limit=1",{ 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+tokenResponse.data.access_token
            },
                method:"GET"
        })
        .then(responseAllCat => {
            const random = getRandomArbitrary(0,responseAllCat.data.playlists.total-1);
            axios("https://api.spotify.com/v1/browse/categories/"+user.room+"/playlists?country=FR&limit=1&offset="+random,{ 
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer "+tokenResponse.data.access_token
                },
                method:"GET"
            })
            .then(responseCat => {
                axios(responseCat.data.playlists.items[0].href,{ 
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer "+tokenResponse.data.access_token
                    },
                    method:"GET"
                })
                .then(responsePlaylist => {
                    let validResponse= [];
                    responsePlaylist.data.tracks.items.forEach(element => {
                        if(element.track.preview_url != null){
                            validResponse.push({song: element.track.preview_url,artists:element.track.artists,title: element.track.name,img:element.track.images[0].url})
                        }
                    });
                    var shuffled = validResponse.sort(()=>{return .5 - Math.random()});
                    var selected=shuffled.slice(0,15);
                    sendMusique("/Genre",0,selected,user);
                })
                .catch(function (error) {
                    console.log(error);
                })
            })
            .catch(function (error) {
                console.log(error);
            })
        })
        .catch(function (error) {
            console.log(error);
        })
    })
    .catch(function (error) {
        console.log(error);
    })
}

function launchCustomGame(user,playlist){
    axios('https://accounts.spotify.com/api/token',{ 
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Authorization' : 'Basic MjFlNWYxZjM3ZDg2NGJiOWJiNjA3YTg3NDhjYTQyYTc6OTkxN2RiNjE4ZjhkNDZmN2IyYWQyZjAzMTI5NmQyMzM='
        },
        data: 'grant_type=client_credentials',
        method:"POST"
     })
    .then(tokenResponse => {
        axios("https://api.spotify.com/v1/playlists/"+playlist,{ 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+tokenResponse.data.access_token
            },
            method:"GET"
        })
        .then(responsePlaylist => {
            let validResponse= [];
            responsePlaylist.data.tracks.items.forEach(element => {
                if(element.track.preview_url != null){
                    validResponse.push({song: element.track.preview_url,artists:element.track.artists,title: element.track.name,img:element.track.images[0].url})
                }
            });
            var shuffled = validResponse.sort(()=>{return .5 - Math.random()});
            var selected=shuffled.slice(0,15);
            sendMusique("/Genre",0,selected,user);
        })
        .catch(function (error) {
            console.log(error);
        })
    })
    .catch(function (error) {
        console.log(error);
    })
}
