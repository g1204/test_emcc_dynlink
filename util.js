module.exports = {
    spawnPromise,
    Deferred,
};

const { spawn } = require("child_process");

function Deferred() {
    let _this = this
    this.promise = new Promise((resolve, reject) => {
        _this.resolve = resolve
        _this.reject = reject
    })
}

function spawnPromise(commandStr, { return_stdout = false, log = console.log, print_cmd = false, nothrow, extraEnv, ignore_error = false } = {}) {
    function escapeShellArg(arg) {
        return `'${arg.replace(/'/g, `'\\''`)}'`;
    }

    let words =
        // commandStr
        //     .replace(/[$";]/g, '\\$&')
        escapeShellArg(commandStr.trim())
            .replace(/[;]/g, '\\$&')
            // .trim()
            .split(' ')
            .filter(str => str.length > 0);
    commandStr = words.join(' ');
    print_cmd && log(commandStr + '\n');
    return new Promise((resolve, reject) => {
        var env = {
            PATH: process.env.PATH,
            // EMCC_DEBUG: 1,
        };
        if (extraEnv) {
            env = Object.assign(env, extraEnv);
        }
        var child;
        let spawnIt = () => {
            // child = spawn(words[0], words.slice(1), {
            child = spawn('sh', ['-c', commandStr], {
                shell: "/bin/bash",
                // env: env,
            });
        };
        if (nothrow) {
            try {
                spawnIt();
            } catch (e) {
            }
        } else {
            spawnIt();
        }

        var stdout = '';
        child.stdout.on('data', function (data) {
            if (return_stdout) {
                stdout += data.toString();
            } else {
                log(data.toString());
            }
        });

        child.stderr.on('data', function (data) {
            ignore_error || log(data.toString());
        });

        child.on('exit', function (code) {
            if (code == 0 || ignore_error) {
                resolve(`${return_stdout ? stdout.trim() : undefined}`);
            } else {
            debugger;
                reject(code);
            }
        });
    });
}