const users = [];

export const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    const existingUser = users.find(user => {
        return user.room === room && user.username === username;
    })

    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    const user = {
        id, username, room
    }

    users.push(user)

    return {user}
}


export const removeUser = (id) => {
    return users.splice(users.findIndex(u => u.id === id), 1)[0];
}

export const getUser = (id) => {
    return users.find(u => u.id === id);
}

export const getUsersInRoom = (room) => {
    return users.filter(u => u.room === room);
}

