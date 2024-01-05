const mqtt = require('mqtt');

module.exports = function(RED) {

    // config参数来访问 节点属性的配置信息(包括节点的可编辑属性defaults)
    function Mqtt_getSingleNodesInfo(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        function base64ToHex(base64) {
            // 将 base64 解码为字节数组
            const raw = Buffer.from(base64, 'base64');
            
            // 将字节数组转化为16进制字符串
            let hex = '';
            for (let i = 0; i < raw.length; i++) {
              const byte = raw[i].toString(16).padStart(2, '0');
              hex += byte;
            }
            
            return hex;
        }

        // 配置信息从Node-RED编辑器中获取
        node.devEUI = config.devEUI;


        var client = mqtt.connect('mqtt://127.0.0.1:1883', {
            clientId: "mqtt-custom-node-" + Math.random().toString(16).substr(2, 8),
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
            qos: 0
        });

        // mqtt连接函数
        client.on('connect', function () {

            let devEUI_value = node.devEUI;
            let devEUI_lowercase;

            if (devEUI_value !== undefined && devEUI_value !== null) {
                devEUI_lowercase = devEUI_value.toLowerCase();
                node.log('Connected to MQTT broker');
                client.subscribe(`application/+/device/${devEUI_lowercase}/event/up`, { qos: 0 });
                node.status({fill:"green",shape:"dot",text:"connected"});
            }

        });


        // mqtt收到信息
        client.on('message', function (topic, message) {
            
            // 解析输入的消息payload（假定其为JSON字符串）
            const Json_payload = message;
            let payload_data;

            // 尝试将JSON字符串解析为JavaScript对象
            try {
                payload_data = JSON.parse(Json_payload);
            } catch (e) {
                // 如果解析失败，抛出错误并退出函数
                node.error("ERROR: Listen to data in non-Json format", message);
                return;
            }

            // 解码devEUI
            var devEUI_hexString = base64ToHex(payload_data.devEUI);
            payload_data.devEUI = devEUI_hexString.toLowerCase();

            // 解码gatewayID
            var gatewayID_hexString = base64ToHex(payload_data.rxInfo[0].gatewayID);
            payload_data.rxInfo[0].gatewayID = gatewayID_hexString.toLowerCase();

            // 解码devAddr
            var devAddr_hexString = base64ToHex(payload_data.devAddr);
            payload_data.devAddr = devAddr_hexString.toLowerCase();


            var msg = { topic: topic, payload: payload_data };
            node.send(msg);
        });




        client.on('error', function (error) {
            // node.error('MQTT client error', error);
            node.status({fill:"red",shape:"ring",text:"connection failed"});
        });



        node.on('close', function () {
            if (client && client.connected) {
                client.end();
            }
        });
    }
    RED.nodes.registerType("Single Node", Mqtt_getSingleNodesInfo);
}