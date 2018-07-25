const WebSocket = require('ws');

const cert = '-----BEGIN CERTIFICATE-----\n\
CERT\n\
-----END CERTIFICATE-----';

const ws = new WebSocket('wss://localhost:9696', {
  rejectUnauthorized: false,
  ca: [cert],
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

ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function incoming(data) {
  console.log(data);
});
