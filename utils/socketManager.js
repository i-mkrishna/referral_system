// Socket manager to handle connected users and avoid circular dependencies
const connectedUsers = {};

let io = null;

const setSocketIO = (socketInstance) => {
    io = socketInstance;
};

const getSocketIO = () => {
    return io;
};

const addUser = (userId, socketId) => {
    connectedUsers[userId] = socketId;
    console.log(`User ${userId} registered with socket ${socketId}`);
};

const removeUser = (socketId) => {
    for (const [userId, userSocketId] of Object.entries(connectedUsers)) {
        if (userSocketId === socketId) {
            delete connectedUsers[userId];
            console.log(`User ${userId} disconnected`);
            break;
        }
    }
};

const getConnectedUsers = () => {
    return connectedUsers;
};

const emitToUser = (userId, event, data) => {
    const socketId = connectedUsers[userId];
    if (socketId && io) {
        io.to(socketId).emit(event, data);
        return true;
    }
    return false;
};

module.exports = {
    setSocketIO,
    getSocketIO,
    addUser,
    removeUser,
    getConnectedUsers,
    emitToUser
}; 