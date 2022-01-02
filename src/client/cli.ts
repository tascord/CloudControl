import { io, Socket } from "socket.io-client";

type Command = {
    description: string;
    usage: string;
    execute: (args: string[]) => void;
}

const Commands: { [command: string]: Command } = {

    "status": {
        description: "Check the status of the CloudConnect daemon.",
        usage: "status",
        execute: (args: string[]) => {

            socket.emit('status', (status: string) => {

                console.log(`Status: ${status}`);
                process.exit(0);

            });

        }
    },

    "pair": {
        description: "Pair new clients with a pairing code.",
        usage: "pair <code>",
        execute: (args: string[]) => {

            if (!args[0]) {
                console.log("Usage: pair <code>");
                return process.exit(1);
            }

            socket.emit('pair', args[0], (err?: string) => {

                if (err) {
                    console.log(err);
                    process.exit(1);
                }

                console.log("Paired client.");
                process.exit(0);

            });

        }
    },

    "link": {
        description: "Connect to a CloudControl server, becoming the host.",
        usage: "link <ip>",
        execute: (args: string[]) => {

            if (!args[0]) {
                console.log("Usage: link <ip>");
                return process.exit(1);
            }

            console.log(`Initiating link...`)
            socket.emit('link', args[0], (err: string) => {

                if (err) {
                    console.log(err);
                    process.exit(1);
                }

                console.log("Connected to CloudControl server.");
                process.exit(0);

            })

        }
    }

}

const args = process.argv.slice(2);
const command = args.shift()?.toLowerCase();
let socket: Socket;

if (!command || !Commands[command]) {

    const commands = Object.keys(Commands);
    const descriptions = commands.map(c => Commands[c].description);
    const usages = commands.map(c => Commands[c].usage);

    console.log("Usage");
    console.log("\t$ cloud-cli <command> [args]");
    console.log("");
    console.log("Commands");

    console.log(Object.entries(Commands).map(([command, { description, usage }]) => `\t${normalize_name(command, commands)}\t${normalize_name(description, descriptions)}\t${normalize_name(usage, usages)}`).join("\n"));
    process.exit(0);
}

// Run commands
(async () => {

    await new Promise<void>((resolve) => {

        socket = io('http://localhost:2121');

        socket.on('connect', () => resolve());
        socket.on('error', () => {
            console.log("Error connecting to local CloudControl daemon.");
            process.exit(1);
        });

    });

    console.log(`Connected to local CloudControl daemon.`);
    Commands[command].execute(args);

})();

function longest(args: string[]) {
    return args.sort((a, b) => b.length - a.length)[0].length;
}

function normalize_name(name: string, all: string[]) {
    return Array(longest(all))
        .fill(' ')
        .map((v, i) => name[i] ?? v)
        .join('');
}