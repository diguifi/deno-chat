import { Server } from './server.ts';


const serverConfigs = {
    defaultPort: 3000
}
let server = new Server(serverConfigs);

server.init();