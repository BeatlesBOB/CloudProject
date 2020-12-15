
const users = [];

function userJoin(id,username,room,point){
    const user = {id,username,room,point};
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


function addPoint(id,point){
    const user = users.find(user => user.id==id);
    user.point += point;
}

module.exports ={
    userJoin,
    getCurrentUser,
    getAllPlayerForRoom,
    userLeft,
    addPoint
}