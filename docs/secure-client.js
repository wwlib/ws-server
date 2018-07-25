const WebSocket = require('ws');

const cert = '-----BEGIN CERTIFICATE-----\n\
CERT\n\
-----END CERTIFICATE-----';

let hostname = 'localhost';
let port = 9696;
let webSocket;

function startWebSocket(onError, onConnect) {
    let connectionString = `wss://${hostname}:${port}`;
    console.log(`startWebSocket: ${connectionString}`);

    if (webSocket) {
        try {
            webSocket.close();
        } catch (e) {
            console.log.error(e);
        }
        webSocket = null;
    }
    try {
        //connect to the certified web socket
        let cas = [cert];
        let webSocket = new WebSocket(connectionString, {
            rejectUnauthorized: false,
            ca: cas,
            checkServerIdentity: ((_serverbane, cert) => {
                // same as tls.connect() option:
                //
                // The method should return undefined if the servername and
                // cert are valid
                var expected_cert_common_name = 'Common-Name';
                if (cert.subject.CN !== expected_cert_common_name) {
                    console.log("Certificate CN doesn't match expected CN: " + expected_cert_common_name);
                }
                return undefined;
            }),
        });

        // let webSocket = new WebSocket(connectionString);

        webSocket.on('error', (e) => {
            if (onError){
                onError(e);
            }
        });

        webSocket.on('open', () => {
            if (onConnect) {
                onConnect(webSocket);
            }

            let message = {
                type: 'handshake',
                status: `OK`,
                name: `secure-client-1`,
                connectionString: `${connectionString}`
            };
            let messageString = JSON.stringify(message);
            console.log(`websocket on open: sending handhake: ${message.connectionString}`);
            webSocket.send(messageString);
        });

        webSocket.on('message', (message, flags) => {
            console.log(`on message: `, message, flags);
            // flags.binary will be set if a binary data is received.
            // flags.masked will be set if the data was masked.
            //console.log(`Rom: webSocket: on message: `, message, flags);
            // console.log('received message: ',message);
            let json;
            try {
                json = JSON.parse(message);
            } catch (e) {
                this.log.error('websocket onMessage: JSON.parse: ', e);
                json = null;
            }
            if (json) {
                //console.log('got json');
                console.log(`on message: `, json);
            }
        });

        webSocket.on('close', () => {
            console.log('websocket client closed')
            webSocket = null;
        });

    } catch (err) {
        webSocket = null;
        console.log(err);
    }
}

startWebSocket();
