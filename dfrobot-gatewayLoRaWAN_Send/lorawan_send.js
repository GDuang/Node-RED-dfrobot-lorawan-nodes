const fs = require('fs');
const request = require('request');
const util = require('util');
const requestPost = util.promisify(request.post);
const requestGet = util.promisify(request.get);
const mqtt = require('mqtt');

module.exports = function(RED) {

    function Mqtt_publishMessage(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // 配置信息从Node-RED编辑器中获取
        node.confirmed = config.confirmed;
        node.devEUI = config.devEUI;
        node.fPort = config.fport;


        // mqtt配置连接参数
        var client = mqtt.connect('mqtt://127.0.0.1:1883', {
            clientId: "mqtt-custom-node-" + Math.random().toString(16).substr(2, 8),
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
            qos: 0
        });


        // mqtt连接成功
        client.on('connect', function () {
            node.log('Connected to MQTT broker');
            node.status({fill:"green",shape:"dot",text:"connected"});
        });

        // node输入处理函数
        node.on('input', function(msg) {

            var loginUrl = 'https://127.0.0.1:8080/api/internal/login';
            var getappIDUrl = `https://127.0.0.1:8080/api/devices/${node.devEUI}`;

            var credentials = {email: "admin", password: "admin"};
            // 读取自签名证书文件
            try {
                    var cert = fs.readFileSync('/etc/nginx/cert/node.cert.pem');
                    var key = fs.readFileSync('/etc/nginx/cert/node.key.pem');
                    // var cert = fs.readFileSync('F:\\cert\\node.cert.pem');
                    // var key = fs.readFileSync('F:\\cert\\node.key.pem');
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
                    rejectUnauthorized: false // 不建议在生产环境中使用此选项
                }
            };


            async function findApplicationID() {
                try {
                    // 获取token(post请求)
                    const loginResponse = await requestPost(loginOptions);
                    const token = loginResponse.body.jwt;

                    // 使用token发出HTTP请求——>获取applicationID列表
                    const appResponse = await requestGet({
                        url: getappIDUrl,
                        headers: {'Authorization': 'Bearer ' + token},
                        agentOptions: {
                            cert: cert,
                            key: key,
                            rejectUnauthorized: false
                        }
                    });

                    var jsonData = JSON.parse(appResponse.body);
                    if (jsonData.hasOwnProperty('device') && jsonData.device.hasOwnProperty('applicationID')) {   }else{
                        return;
                    }

                    var appID = jsonData.device.applicationID;

                    let devEUI_value = node.devEUI;
                    let devEUI_lowercase;
                    if (devEUI_value !== undefined && devEUI_value !== null) {
                        devEUI_lowercase = devEUI_value.toLowerCase();
        
          


                    if (Buffer.isBuffer(msg.payload)) {
                        msg.payload = msg.payload.toString('base64');
                        console.log("msg.payload = " + msg.payload)
                    } else if (typeof msg.payload === "string") {
                        msg.payload = Buffer.from(msg.payload).toString('base64');
                        console.log("msg.payload = " + msg.payload)
                    } else if (Array.isArray(msg.payload)) {
                        msg.payload = Buffer.from(msg.payload).toString('base64');
                        console.log("msg.payload = " + msg.payload)
                    } else {
                        throw new Error('Payload must be a buffer/string/JSON array');
                    }
                        
                          



        
                        if(appID === undefined) {
                            node.error("The device specified devEUI was not found");
                            return;
                        }
        
                        let Json_data = {
                            "applicatrionID": appID,
                            "devEUI": node.devEUI,
                            "confirmed": node.confirmed == "true" ? true : false,
                            "fPort": Number(node.fPort),
                            "data": msg.payload,
                            "object": null
                        }

                        // console.log(JSON.stringify(Json_data))
        
                        client.publish(`application/${appID}/device/${devEUI_lowercase}/command/down`, JSON.stringify(Json_data), { qos: 0 });
        
                    }

                } catch (err) {
                    node.error(err);
                }
            }
            findApplicationID();

        });




  

        // mqtt错误信息
        client.on('error', function (error) {
            // node.error('MQTT client error', error);
            node.status({fill:"red",shape:"ring",text:"connection failed"});
        });

        // 关闭或删除节点，断开mqtt连接
        node.on('close', function () {
            if (client && client.connected) {
                client.end();
            }
        });
    }

    
    RED.nodes.registerType("LW Send", Mqtt_publishMessage);
}
