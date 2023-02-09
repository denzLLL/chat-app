const generateMessage = (text, username) => {
    return {
        text,
        createdAt: new Date().getTime(),
        username
    }
}

export default generateMessage;


const generateLocationMessage = (url, username) => {
    return {
        url,
        createdAt: new Date().getTime(),
        username
    }
}

export {
    generateLocationMessage
}
