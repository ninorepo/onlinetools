//////////////////////////////
// IndexedDB helper
//////////////////////////////

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("ffmpeg-cache", 1);

        req.onupgradeneeded = () => {
            req.result.createObjectStore("files");
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

function idbSet(db, key, value) {
    return new Promise((resolve) => {
        const tx = db.transaction("files", "readwrite");
        tx.objectStore("files").put(value, key);
        tx.oncomplete = resolve;
    });
}

function idbGet(db, key) {
    return new Promise((resolve) => {
        const tx = db.transaction("files", "readonly");
        const req = tx.objectStore("files").get(key);
        req.onsuccess = () => resolve(req.result);
    });
}

//////////////////////////////
// download helper
//////////////////////////////

async function downloadText(url) {
    const res = await fetch(url);
    return await res.text();
}

async function downloadBase64(url) {
    const res = await fetch(url);
    return await res.text(); // assuming base64 file hosted
}

//////////////////////////////
// bootstrap loader
//////////////////////////////

async function bootstrapFFmpeg() {

    const db = await openDB();

    let coreJS = await idbGet(db, "coreJS");
    let workerJS = await idbGet(db, "workerJS");
    let wasmB64 = await idbGet(db, "wasmB64");

    // FIRST RUN → download & cache
    if (!coreJS || !workerJS || !wasmB64) {

        console.log("Downloading FFmpeg assets...");

        coreJS = await downloadText("../asset/ffmpeg/umd/ffmpeg-core.js");
        //workerJS = await downloadText("./ffmpeg-core.worker.js");
        wasmB64 = await downloadBase64("../asset/ffmpeg/umd/ffmpeg-core.txt");

        await idbSet(db, "coreJS", coreJS);
        //await idbSet(db, "workerJS", workerJS);
        await idbSet(db, "wasmB64", wasmB64);
    }

    console.log("Loaded from cache");

    //////////////////////////////
    // convert to runtime assets
    //////////////////////////////

    function b64ToBytes(b64) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
            bytes[i] = bin.charCodeAt(i);
        }
        return bytes;
    }

    const wasmURL = URL.createObjectURL(
        new Blob([b64ToBytes(wasmB64)], {
            type: "application/wasm"
        })
    );

    const coreURL = URL.createObjectURL(
        new Blob([coreJS], { type: "application/javascript" })
    );

    const workerURL = URL.createObjectURL(
        new Blob([workerJS], { type: "application/javascript" })
    );

    //////////////////////////////
    // start FFmpeg
    //////////////////////////////

    const ffmpeg = new FFmpeg();

    await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL
    });

    return ffmpeg;
}

