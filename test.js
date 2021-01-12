const http = require('http');
const fs = require('fs');
const { join } = require('path');
const { spawnPromise, Deferred } = require('./util');

const scriptDir = __dirname;

if (require.main === module) {
    test();
}

async function test() {
    await spawnPromise('bash compile_emcc.sh');

    const port = 3002;
    var callbacks = []
    createServer(port, scriptDir, (server, obj) => {
        if (obj.error) {
            console.error(obj.error);
        } else {
            console.log(JSON.stringify(obj));
        }
    });
}

function createServer(port, root, callback) {
    var server = http.createServer();
    server.on('request', function (request, response) {
        const url = request.url;
        if (url.startsWith('/log')) {
            let parsedUrl = require("url").parse(url, true); // true to get query as object
            let obj = parsedUrl.query;
            callback(server, obj);
        } else {
            returnResource(url, response, root);
        }
        response.end();
    })

    let deferred = new Deferred();

    server.listen(port, function () {
        console.log(`server started, please open http://127.0.0.1:${port}/index.html to run test`);
        deferred.resolve(server);
    })

    return deferred.promise;
}

function returnResource(url, response, root) {
    if (url === '/' || url === '/favicon.ico') {
        return;
    }

    console.log(`request ${url}`);

    if (url.endsWith('.js')) {
        response.setHeader('Content-Type', 'application/x-javascript');
    } else if (url.endsWith('.wasm')) {
        response.setHeader('Content-Type', 'application/wasm');
    }

    try {
        const file_content = fs.readFileSync(`${join(root, url)}`);
        response.write(file_content);
    } catch (error) {
        debugger
    }
}
