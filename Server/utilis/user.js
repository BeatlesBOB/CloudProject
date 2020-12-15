
const users = [];

function userJoin(id,username,room,point,img){
    const user = {id,username,room,point,img,answeredArtiste:false,answeredSong:false};
    users.push(user);
    return user;
}

function userLeft(id){
    const index = users.findIndex(user => user.id === id);
    if(index !==-1){
        return users.splice(index,1)[0];
    }
}

function getCurrentUser(id){
    return users.find(user => user.id==id)
}

function getAllPlayerForRoom(room){
    return users.filter(user => user.room === room)
}

function asAnswerSong(id,bool){
    const user = users.find(user => user.id==id);
    user.answeredSong = bool;
}

function asAnswerArtiste(id,bool){
    const user = users.find(user => user.id==id);
    user.answeredArtiste = bool;
}
function addPoint(id){
    const user = users.find(user => user.id==id);
    user.point = user.point+1;
}

module.exports ={
    userJoin,
    getCurrentUser,
    getAllPlayerForRoom,
    userLeft,
    addPoint,
    asAnswerSong,
    asAnswerArtiste
}