const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('[name="message"]');
const $messageFormButton = document.querySelector('#message-button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messagesTmpl = document.querySelector('#message-tmpl').innerHTML;
const locationTmpl = document.querySelector('#location-tmpl').innerHTML;
const sidebarTmpl = document.querySelector('#sidebar-template').innerHTML;

// query params
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;
    // height of the new message
    const mewMessageStyles = getComputedStyle($newMessage);
    const mewMessageMargin = parseInt(mewMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + mewMessageMargin;
    // visible height
    const visibleHeight = $messages.offsetHeight;
    // height of messages container
    const containerHeight = $messages.scrollHeight;
    // how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', ({text, createdAt, username}) => { // from server with payload
    const html = Mustache.render(messagesTmpl, {
        message: text,
        createdAt: moment(createdAt).format('H:m a'),
        username
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', ({url, createdAt, username}) => {
    const html = Mustache.render(locationTmpl, {
        url,
        createdAt: moment(createdAt).format('H:m a'),
        username
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTmpl, {
        room,
        users
    });

    $sidebar.innerHTML = html;
});

// listeners:

$messageForm.addEventListener('submit', e => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => { // 3 param - acknowledgement cb (see index.js)
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
        console.log('Message delivered');
    });
});

$sendLocationButton.addEventListener('click', e => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords;
        socket.emit('sendLocation', `https://google.com/maps?q=${latitude},${longitude}`, (message) => {
            $sendLocationButton.removeAttribute('disabled');
        });
    })
});

//
socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        console.error(error);
        alert(error);
        location.href = '/';
    }
})
