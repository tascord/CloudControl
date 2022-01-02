<div align="center">
  <h1>
    <img src="/web/logo.png" style="width: 2.5rem" />
    CloudControl
  </h1>
</div>

<br/>

### Setting up CloudControl (Client)
1) Install the `cctrl` binary with `npm i cctrl`.
2) Configure the `dist/client/service.js` file to run at launch. (Wiki coming soon)
3) Use the cli tool, `cctrl` to link up to your host `cctrl link <host>`.
4) Pair devices with `cctrl pair <code>`.

### Setting up CloudControl (Server)
1) Install the `cctrl` binary with `npm i cctrl`.
2) Configure the `dist/server/service.js` file to run at launch. (Wiki coming soon)
3) Connect your host.
4) Visit **:2122** to pair devices, alongside the client CLI tool.

### What is CloudControl
CloudControl is an application which allows a host computer to be remotely controlled via one, or many, paired devices. The commands which are sent via the paired devices are routed through a server with a known IP, so it's ideal for, and intended use-case is, having a home host device connecting to the server, then being able to tinker with the computer from afar via pairing your phone, watch, or whatever to it.

### Be careful.
I am literally a child lol.
I am proficient with my coding, but there might be massive RCE vulnerabilities. It wouldn't be surprising for this type of program. Update often, and only use this software on things that either:
a) no one will have access to
b) you don't care if someone were to access it or wipe it

Basically, if anything happens, I warned you.

### Contributing
Sure, go ahead! I'll look through all pull requests as soon as I can, and if they get to be too much, I'm happy to bring on other collaborators!
