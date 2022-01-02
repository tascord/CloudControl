import { fetch_or_create_file } from "./helpers";
import { Socket, Server as SocketServer } from "socket.io";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import express from "express";
import http from "http";

class Service {

    private _config: Array<string> = JSON.parse(fetch_or_create_file('allowed_config.json', '[]', true));
    private _in_use_pairing_codes: { [pairing_code: string]: Socket } = {};
    private _host?: Socket;

    public get config(): Array<string> {
        return this._config;
    }

    private set config(token: Array<string>) {
        this._config = token;
        writeFileSync(join(__dirname, 'allowed_config.json'), JSON.stringify(token));
    }

    // Pairing system
    public get_pairing_code(socket: Socket): string {
        let code = this.generate_pairing_code();
        this._in_use_pairing_codes[code] = socket;
        return code;
    }

    public try_pairing_code(code: string): Promise<void> {
        return new Promise((resolve, reject) => {

            if (!this._in_use_pairing_codes[code]) {
                return reject("No client is using this pairing code.");
            }

            const token = this.generate_access_token();
            this.config = this.config.concat(token);

            this._in_use_pairing_codes[code].emit('paired', token);
            delete this._in_use_pairing_codes[code];

            resolve();

        });


    }

    // Generators
    public generate_pairing_code(): string {
        let code;

        do {
            code = randomBytes(4).toString('hex');
        } while (this._in_use_pairing_codes[code]);

        return code;
    }

    public generate_access_token(): string {

        let code;

        do {
            code = randomBytes(24).toString('hex');
        } while (this.config.includes(code));

        return code;

    }

    // Executors
    public execute(token: string, command: string): Promise<void> {

        return new Promise((resolve, reject) => {

            if (!this.config.includes(token)) {
                return reject("Invalid token.");
            }

            if (!this._host) {
                return reject("No host connected.");
            }

            this._host.emit('execute', command, (error?: string) => {

                if (error) {
                    return reject(error);
                }

                resolve();

            });

        });

    }

    // Set host
    public set_host(socket: Socket): void {
        this._host = socket;

        socket.on('disconnect', () => {
            this._host = undefined;
        })
    }

    // Has host
    public has_host(): boolean {
        return !!this._host;
    }

    // Check credentials
    public login(token: string) {
        return this.config.includes(token);
    }

    public is_host(socket: Socket): boolean {
        return socket.id == this._host?.id;
    }

}

const service = new Service();
export default service;

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

app.get('*', (req, res) => {

    let path = join(__dirname, 'web', req.path.slice(1) || 'index');

    if (!existsSync(path)) {
        path += '.html';
    }

    if (!existsSync(path)) {
        return res.status(404).send('404');
    }

    res.sendFile(path);

})

console.clear();
server.listen(process.env.PORT || 2122, () => console.log("Server Service listening on port " + (process.env.PORT || 2122)));

io.on('connection', socket => {

    socket.on('pair', (callback) => {
        callback(service.get_pairing_code(socket));
    })

    socket.on('host_status', (callback) => {
        callback(service.has_host());
    })

    socket.on('login', (token, callback) => {
        callback(service.login(token));
    })

    socket.on('pair_client', (code, callback) => {

        if (!service.has_host()) {
            return callback("No host connected.");
        }

        if (!service.is_host(socket)) {
            return callback("You are not the host.");
        }

        service.try_pairing_code(code)
            .then(() => callback())
            .catch(error => callback(error));


    });

    socket.on('execute', (token?, command?, callback?) => {

        if(!token || !command || !callback) return;

        if (!service.has_host()) {
            return callback("No host connected.");
        }

        service.execute(token, command)
            .then(() => callback())
            .catch(error => callback(error));

    });

    socket.on('link', (callback) => {

        if (service.has_host()) {
            return callback('Host already connected.');
        }

        service.set_host(socket);
        callback();
    })

});