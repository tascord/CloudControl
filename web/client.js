const Socket = io();
const Elements = {
    host_status: document.getElementById('host_status'),
    client_status: document.getElementById('client_status'),
    exec_form: document.getElementById('exec'),
    connect_button: document.getElementById('connect'),
}

let last_login_state = '';

Socket.on('paired', (token) => {
    window.localStorage.setItem('token', token);
    is_pairing = false;
    update();
})

function update() {

    // Query the server for the current status of the host
    Socket.emit('host_status', (connected) => {
        Elements.host_status.innerText = connected ? 'Connected' : 'Disconnected';
    })

    // Check if the client is connected
    let token = window.localStorage.getItem('token');
    if (!token) Elements.client_status.innerText = 'Un-paired.';

    Socket.emit('login', token, (valid) => {

        if(last_login_state !== valid) {
            last_login_state = valid;
        } else {
            return;
        }

        if(valid) {
            Elements.client_status.innerText = 'Paired.';
            Elements.exec_form.style.display = 'block';
            Elements.connect_button.style.display = 'none';
        } else {
            Elements.client_status.innerText = 'Un-paired.';
            Elements.exec_form.style.display = 'none';
            Elements.connect_button.style.display = 'block';
        }
    })

}

update();
setInterval(update, 1000);

// Send pair request
Elements.connect_button.onclick = () => {

    is_pairing = true;

    Socket.emit('pair', (code) => {
        Elements.client_status.innerHTML = `<sub>Pair with code</sub><br/>${code}`;
        Elements.connect_button.style.display = 'none'; 
    })

}

// Send raw commands
Elements.exec_form.onsubmit = (e) => {
    e.preventDefault();

    Elements.client_status.innerText = 'Executing...';
    Socket.emit('execute', window.localStorage.getItem('token'), Elements.exec_form.command.value, (error) => {
        
        if(error) {
            Elements.client_status.innerText = 'Error executing command.';
            console.log(error);
        }

        Elements.client_status.innerText = 'Executed.';

    });

    Elements.exec_form.command.value = '';
}