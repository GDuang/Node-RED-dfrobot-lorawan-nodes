
const fs = require('fs');
const request = require('request');
const util = require('util');
const requestPost = util.promisify(request.post);
const requestGet = util.promisify(request.get);

module.exports = function(RED) {
    function HttpRequestNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function(msg) {
            var loginUrl = 'https://127.0.0.1:8080/api/internal/login';
            var applicationIDUrl = 'https://127.0.0.1:8080/api/applications';

            var credentials = {email: "admin", password: "admin"};

            try {
                var cert = fs.readFileSync('/etc/nginx/cert/node.cert.pem');
                var key = fs.readFileSync('/etc/nginx/cert/node.key.pem');
              } catch (error) {
                this.log("找不到证书文件：" + error);
              }

            var loginOptions = {
                url: loginUrl,
                body: credentials,
                json: true,
                agentOptions: {
                    cert: cert,
                    key: key,
                    rejectUnauthorized: false
                }
            };

            async function fetchAllDevices() {
                try {
                    // 获取token(post请求)
                    const loginResponse = await requestPost(loginOptions);
                    const token = loginResponse.body.jwt;

                    // 使用token发出HTTP请求——>获取applicationID列表
                    const appResponse = await requestGet({
                        url: applicationIDUrl,
                        headers: {'Authorization': 'Bearer ' + token},
                        agentOptions: {
                            cert: cert,
                            key: key,
                            rejectUnauthorized: false
                        }
                    });

                    var jsonData = JSON.parse(appResponse.body);
                    var devicesRequests = jsonData.result.map(app => {
                        return requestGet({
                            url: `https://127.0.0.1:8080/api/devices?applicationID=${app.id}&limit=100&offset=0`,
                            headers: {'Authorization': 'Bearer ' + token},
                            agentOptions: {
                                cert: cert,
                                key: key,
                                rejectUnauthorized: false
                            }
                        });
                    });

                    const devicesResponses = await Promise.all(devicesRequests);
                    var payload = {};
                    var index = 0;

                    devicesResponses.forEach((deviceRes) => {
                        var data = JSON.parse(deviceRes.body);
                        data.result.forEach((device) => {
                            index += 1;
                            let tempKey = `Node-Device${index}`;
                            payload[tempKey] = {
                                devEUI: device.devEUI,
                                name: device.name,
                                applicationID: device.applicationID
                            };
                        });
                    });

                    msg.payload = payload;
                    msg.topic = 'Node devices List';
                    node.send(msg);
                } catch (err) {
                    node.error(err);
                }
            }

            fetchAllDevices();
        });
    }
    RED.nodes.registerType("Node List", HttpRequestNode);
};
