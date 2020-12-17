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
const {userJoin,getCurrentUser,userLeft,getAllPlayerForRoom,addPoint,asAnswerSong,asAnswerArtiste,resetPoint} = require("./utilis/user")
const user = require('./utilis/user');
var CronJob = require('cron').CronJob;
const cors = require('cors')
app.use(cors());
app.use(express.json())


io.of("/genre").on("connection",(socket)=>{
    socket.emit("Welcome",socket.id);

    socket.on("disconnectCustom", socketid =>{
        const user = userLeft(socketid);
        if(user){
            socket.leave(user.room);
            io.of("/genre").to(user.room).emit("suppUser", user.userName+"est partie de :"+user.room);
            io.of("/genre").to(user.room).emit("roomInfo",{
                room: user.room,
                users: getAllPlayerForRoom(user.room)
            });
        }
    });

    socket.on("answer",({answer,goodArtiste,goodSong}) =>{
        var cleanedArtiste = cleanUpSpecialChars(goodArtiste.toUpperCase());
        var cleanedSong = cleanUpSpecialChars(goodSong.toUpperCase());
        var cleanedAnswer = cleanUpSpecialChars(answer.toUpperCase());
        var currentUser = getCurrentUser(socket.id);
        
        DiffArtiste = answerVerification(cleanedArtiste,cleanedAnswer);
        DiffSong = answerVerification(cleanedSong,cleanedAnswer);

        if(!currentUser.answeredArtiste || !currentUser.answeredSong){
            if(currentUser.answeredArtiste==false && DiffArtiste){
                io.of("/genre").to(socket.id).emit("resultArtist", true);
                asAnswerArtiste(socket.id,true);
                addPoint(socket.id);
                io.of("/genre").to(currentUser.room).emit("roomInfo",{
                    room: user.room,
                    users: getAllPlayerForRoom(currentUser.room)
                });
            
            }else{
                io.to(socket.id).emit("resultAnswer", "pas bon ou déja répondue");
            }
            
            if(currentUser.answeredSong == false && DiffSong){
                io.of("/genre").to(socket.id).emit("resultSong",true);
                asAnswerSong(socket.id,true);
                addPoint(socket.id);
                io.of("/genre").to(currentUser.room).emit("roomInfo",{
                    room: user.room,
                    users: getAllPlayerForRoom(currentUser.room)
                });
            }else{
                io.to(socket.id).emit("resultAnswer", "pas bon ou déja répondue");
            }
        }
    })

    socket.on("joinRoom", ({userName,room,playerImg}) =>{
        const user = userJoin(socket.id,userName,room,0,playerImg,false);
        socket.join(user.room);
        io.of("/genre").to(user.room).emit("newUser", user.username+" est rentré dans: "+room+" faites lui une ovation");
        io.of("/genre").to(user.room).emit("roomInfo",{
            room: user.room,
            users: getAllPlayerForRoom(user.room)
        });
        if(getAllPlayerForRoom(user.room).length > 1)
        {
            io.of("/genre").to(user.room).emit('Waiting',user.username+" attendez la prochaine musique avant de pouvoir jouer");
        }else{
            launchGame(user);
        }
    });

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        io.of("/genre").to(user.room).emit('message', {from : user,fromImg:user.img, message : msg,time});
    });

    socket.on('chatMessagePrivate', ({idReceiver,msg}) => {
        const user = getCurrentUser(socket.id);
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        socket.to(idReceiver).emit('privateMessage', {from : user.username,fromImg:user.img, message : msg,time}); 
    });

});

io.of("/custom").on("connection",(socket)=>{
    console.log("non plus")
    
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

    socket.on("answer",({answer,goodArtiste,goodSong}) =>{
        var DiffArtiste = answerVerification(goodArtiste,answer);
        var DiffSong = answerVerification(goodSong,answer);
        var currentUser = getCurrentUser(socket.id);
        if(!currentUser.answeredArtiste || !currentUser.answeredSong){
            if(!currentUser.answeredArtiste && DiffArtiste){
                io.to(socket.id).emit("resultAnswer", "vous avez trouver l'artiste");
                io.of("/Custom").to(user.room).emit("roomInfo",{
                    room: user.room,
                    users: getAllPlayerForRoom(user.room)
                });
                asAnswerArtiste(socket.id,true);
                addPoint(socket.id);
            }else{
                io.to(socket.id).emit("resultAnswer", "pas bon ou déja répondue");
            }
            
            if(!currentUser.answeredSong && DiffSong){
                io.to(socket.id).emit("resultAnswer", "vous avez trouver la chanson");
                io.of("/Custom").to(user.room).emit("roomInfo",{
                    room: user.room,
                    users: getAllPlayerForRoom(user.room)
                });
                asAnswerSong(socket.id,true);
                addPoint(socket.id);
            }else{
                io.to(socket.id).emit("resultAnswer", "pas bon ou déja répondue");
            }

            if(!currentUser.answeredSong && DiffSong === null){
                io.to(socket.id).emit("resultAnswer", "vous avez presque la chanson");
            }
            if(!currentUser.answeredSong && DiffArtiste === null){
                io.to(socket.id).emit("resultAnswer", "vous avez presque l'artiste");
            }
        }
    })

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
            io.of("/Custom").to(user.room).emit('admin',true);
        }
    });

    socket.on("startGame",(playlistId)=>{
        const user = getCurrentUser(socket.id)
        launchCustomGame(user,playlistId)
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

io.on("connection",(socket) =>{
})

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
        axios("https://api.spotify.com/v1/browse/categories?country=FR",{ 
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

app.get('/artistes/:id', async function(req, res) {
    let tokenResponse;
    let artResponse;
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
        artResponse = await
        axios("https://api.spotify.com/v1/artists/"+req.params.id,{ 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+tokenResponse.data.access_token
            },
            method:"GET"
        })
        return res.status(200).send({
            statusCode: 200,
            data: artResponse.data
        });
    }catch(error){
        console.log(error)
        return res.status(500).json({
            statusCode: 500,
            data: null
        });
    }   
});

app.get('/album/:id', async function(req, res) {
    let tokenResponse;
    let albResponse;
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
        albResponse = await
        axios("https://api.spotify.com/v1/albums/"+req.params.id,{ 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+tokenResponse.data.access_token
            },
            method:"GET"
        })
        return res.status(200).send({
            statusCode: 200,
            data: albResponse.data
        });
    }catch(error){
        console.log(error)
        return res.status(500).json({
            statusCode: 500,
            data: null
        });
    }   
});

app.get('/search', async function(req, res) {
    let tokenResponse;
    let albResponse;
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
        albResponse = await
        axios("https://api.spotify.com/v1/search?q="+req.query.q+"&type="+req.query.type,{ 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+tokenResponse.data.access_token
            },
            method:"GET"
        })
        return res.status(200).send({
            statusCode: 200,
            data: albResponse.data
        });
    }catch(error){
        console.log(error)
        return res.status(500).json({
            statusCode: 500,
            data: null
        });
    }   
});

app.get('/tracks/:id', async function(req, res) {
    let tokenResponse;
    let trackResponse;
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
        trackResponse = await
        axios("https://api.spotify.com/v1/tracks/"+req.params.id,{ 
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+tokenResponse.data.access_token
            },
            method:"GET"
        })
        return res.status(200).send({
            statusCode: 200,
            data: albResponse.data
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
            if(getCurrentUser(user.id)!= undefined){
                gameFinish(of,user,45);
            }
        }
        if(getCurrentUser(user.id)!= undefined){
            asAnswerArtiste(user.id,false);
            asAnswerSong(user.id,false);
            io.of(of).to(user.room).emit('playlist',playlist[index]);
        }
        index++;
    }, null, true, 'Europe/Paris');
    playlistJob.start();  
}

function gameFinish(of,user,sec){
    var startGameJob = new CronJob('* * * * * *', ()=>{
        io.of(of).to(user.room).emit('gameRestart',"La partie va recommancer dans "+sec+" sec");
        sec--;
        if(sec <= 0){
            const tempuser = getAllPlayerForRoom(user.room)
            tempuser.forEach(player =>{
                resetPoint(player.id)
            })
            startGameJob.stop();
            launchGame(user);
            io.of("/genre").to(user.room).emit("roomInfo",{
                room: user.room,
                users: getAllPlayerForRoom(user.room)
            });
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
                            validResponse.push({song: element.track.preview_url,artists:element.track.artists,title: element.track.name,img : element.track.album.images[0].url })
                        }
                    });
                    var selected = validResponse.sort(() => Math.random() - Math.random()).slice(0, 15)

                    sendMusique("/genre",0,selected,user);
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
                    validResponse.push({song: element.track.preview_url,artists:element.track.artists,title: element.track.name})
                }
            });
            var shuffled = validResponse.sort(()=>{return .5 - Math.random()});
            var selected=shuffled.slice(0,15);
            sendMusique("/custom",0,selected,user);
        })
        .catch(function (error) {
            console.log(error);
        })
    })
    .catch(function (error) {
        console.log(error);
    })
}

function cleanUpSpecialChars(str)
{
    return str
        .replace(/[ÀÁÂÃÄÅ]/g,"A")
        .replace(/[àáâãäå]/g,"a")
        .replace(/[ÈÉÊË]/g,"E")
        .replace(/[èéêë]/g,"e")
        .replace(/[^a-z0-9]/gi,''); // final clean up
}

function answerVerification(answer, answerOfPlayer)
{
    let arrayAnswer = answer.split('');
    let arrayAnswerOfPlayer = answerOfPlayer.split('');
    let difference = array_diff(arrayAnswer, arrayAnswerOfPlayer);
    if(difference === 0)
    {
        return true;
    }else if(difference <= 2)
    {
        return null
    }else{
        return false;
    }
}

function array_diff(array1, array2)
{
    let diffArray = 0;
    if(array1.length >= array2.length)
    {
      for(let i = 0; i <= array1.length;i++)
      {
        if(array1[i] !== array2[i])
        {
          diffArray = diffArray+1;
        }
      }
    }else{
      for(let i = 0; i <= array2.length;i++)
      {
        if(array2[i] !== array1[i])
        {
          diffArray = diffArray+1;
        }
      }
    }
    return diffArray;
}