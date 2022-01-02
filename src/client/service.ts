#!/usr/bin/env node

import { Server as SocketServer } from "socket.io";
import express from "express";
import http from "http";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { io, Socket } from "socket.io-client";
import { execSync } from "child_process";
import { homedir } from "os";

const app = express();
const server = http.createServer(app);
const socket_server = new SocketServer(server);

console.clear();
const config_file_location = join(homedir(), '.ccservice-client-ip');
server.listen(process.env.PORT || 2121, () => console.log("Client Service listening on port " + (process.env.PORT || 2121)));
let ip: string | false = existsSync(config_file_location) ? readFileSync(config_file_location, 'utf8') : false;
let client_socket: Socket | undefined = ip ? io(ip, { port: 2122 }) : undefined;

if(client_socket) {
    setup(client_socket);
    client_socket.emit('link', (err?: string) => {
        if(err) {
            console.log(`Unable to link with CloudControl server after launch: ${err}.`);
        }
    });
}

socket_server.on('connection', socket => {

    socket.on('status', (callback) => {

        let statuses = [];
        
        if(client_socket && client_socket.connected) statuses.push('Connected to host CloudConnect server @ ' + ip);
        else statuses.push('Not connected to host CloudConnect server.');

        statuses.push(`Running daemon on port ${process.env.PORT || 2122}.`);


        callback(statuses.join('\n'));
    })

    socket.on('link', (address, callback) => {
        
        ip = address;
        client_socket = io(address, { port: 2122 });
        setup(client_socket);

        client_socket.on('error', () => {
            callback("Error connection to CloudControl server.");
            client_socket = undefined;
        })

        client_socket.on('connect', () => {

            client_socket?.emit('link', (err?: string) => {
               
                writeFileSync(config_file_location, address);
                callback(err);

            })
            
        })

    });

    socket.on('pair', (code, callback) => {
        if(!client_socket) return callback("No code to pair with.");
        client_socket?.emit('pair_client', code, callback);
    });

})

function setup(socket: Socket) {

    socket.on('execute', (command, callback) => {
        console.log(`Running '${command}'.`);
        
        try {
            execSync(command);
            callback();
        } catch(e) {
            callback(e)
        }
    })

}