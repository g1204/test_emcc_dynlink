
var should_load_side_module = true;

(async function () {
    try {
        let { load_js, load_wasm, instance } = await benchmarkLoadScript('/main_module.js');

        log(`load main_module.js ${load_js} ms`);
        log(`load main_module.wasm ${load_wasm} ms`);

        var load_side_module = 0;
        if (should_load_side_module) {
            let before_load = performance.now();
            await loadLib(instance, '/side_module.wasm');
            load_side_module = performance.now() - before_load;
            log(`load side_module.wasm ${load_side_module} ms`);
            log(`instance.bar() returns ${instance.bar()}`);
        }

        let total_time = load_js + load_wasm + load_side_module;
        (new Image).src = '/log?load_js=' + escape(load_js)
            + '&load_wasm=' + escape(load_wasm)
            + (should_load_side_module ? ('&load_side_module=' + escape(load_side_module)) : '')
            + '&total=' + escape(total_time);

    } catch (e) {
        (new Image).src = '/log?error=' + escape(e + '');
        return;
    }
})();

function benchmarkLoadScript(url) {
    return new Promise((resolve, reject) => {
        var oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        oScript.src = url;

        var startTime, endTime;
        oScript.onload = function () {
            let load_js = performance.now() - startTime;
            startTime = performance.now();
            let printErr = err => {
                logError(err);
            };
            let print = msg => {
                log(msg);
            };
            MODULE({
                printErr,
                print,
            }).then(instance => {
                endTime = performance.now();
                resolve({
                    load_js,
                    load_wasm: endTime - startTime,
                    instance,
                });
            }).catch((reason) => {
                reject(`Module throws: ${reason}`);
            })
        };

        oScript.onerror = function (reason) {
            reject(`script.onerror: ${reason}`);
        };

        startTime = performance.now();
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(oScript);
    })
}

async function loadLib(instance, lib) {
    log(`loading ${lib}...`)
    await instance.loadDynamicLibrary(lib, { loadAsync: true, global: true, nodelete: true });
    log(`loaded ${lib}.`)
}

function log(str) {
    document.getElementById('log').innerHTML += str + '<BR/>';
}

function logError(str) {
    document.getElementById('error').innerHTML += str + '<BR/>';
}