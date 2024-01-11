const mqtt = require('mqtt');

module.exports = function(RED) {
    function gatewayEvent(config) {
        RED.nodes.createNode(this, config);
        // 配置信息从Node-RED编辑器中获取
        var node = this;

        node.checkbox1_Power_On = config.checkbox1_Power_On;
        // node.checkbox2_Power_Off = config.checkbox2_Power_Off;
        node.checkbox3_WAN_Up = config.checkbox3_WAN_Up;
        node.checkbox4_WAN_Down = config.checkbox4_WAN_Down;
        node.checkbox5_Cellular_Up = config.checkbox5_Cellular_Up;
        node.checkbox6_Cellular_Down = config.checkbox6_Cellular_Down;
        node.checkbox7_VPN_Up = config.checkbox7_VPN_Up;
        node.checkbox8_VPN_Down = config.checkbox8_VPN_Down;
        node.outputs = config.outputs;


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
            // 订阅所有的网关事件
            client.subscribe('/system/event/+', { qos: 0 });
            // client.subscribe('application/+/device/+/event/up', { qos: 0 });
            node.status({fill:"green",shape:"dot",text:"connected"});
        });


        // mqtt收到信息
        client.on('message', function (topic, message) {

            // 准备一个数组来存储将要发送的消息(rules数组长度对应输出端口数量)
            var messages = new Array(node.outputs);

            let index = 0;
            // console.log("topic = " + topic)
            // console.log("message = " + message)

            // 尝试将JSON字符串解析为JavaScript对象
            try {
                message_fromParse = JSON.parse(message);
            } catch (e) {
                // 如果解析失败，抛出错误并退出函数
                node.error("ERROR: Listen to data in non-Json format", message);
                return;
            }


            if(node.checkbox1_Power_On === true) {
                if( message_fromParse.type === 'event_power_on') {
                    // 待完成：获取得到message后，对message解析——>得出Power_On是true还是false
                    let msg_obj = {
                        "topic": topic,
                        "payload": {
                                    "gatewayID": message_fromParse.gatewayID,
                                    "type": message_fromParse.type,
                                    "describe": message_fromParse.describe
                                   }   
                    }
                    messages[index] = msg_obj;
                    // console.log("messages = " + JSON.stringify(messages))
                }
                index++;
            }   
            if(node.checkbox3_WAN_Up === true) {
                if( topic === '/system/event/event_wan_on') {
                    let msg_obj = {
                        "topic": topic,
                        "payload": {
                                    "gatewayID": message_fromParse.gatewayID,
                                    "type": message_fromParse.type,
                                    "describe": message_fromParse.describe
                                   }   
                    }
                    messages[index] = msg_obj;
                    // console.log("messages = " + JSON.stringify(messages))
                }
                index++;
            } 
            if(node.checkbox4_WAN_Down === true) {
                if( topic === '/system/event/event_wan_down') {

                    let msg_obj = {
                        "topic": topic,
                        "payload": {
                                    "gatewayID": message_fromParse.gatewayID,
                                    "type": message_fromParse.type,
                                    "describe": message_fromParse.describe
                                   }   
                    }
                    messages[index] = msg_obj;
                    // console.log("messages = " + JSON.stringify(messages))
                }
                index++;
            } 
            if(node.checkbox5_Cellular_Up === true) {
                if( topic === '/system/event/event_cellular_up') {
                    let msg_obj = {
                        "topic": topic,
                        "payload": {
                                    "gatewayID": message_fromParse.gatewayID,
                                    "type": message_fromParse.type,
                                    "describe": message_fromParse.describe
                                   }   
                    }
                    messages[index] = msg_obj;
                }
                index++;
            } 
            if(node.checkbox6_Cellular_Down === true) {
                if( topic === '/system/event/event_cellular_down') {
                    let msg_obj = {
                        "topic": topic,
                        "payload": {
                                    "gatewayID": message_fromParse.gatewayID,
                                    "type": message_fromParse.type,
                                    "describe": message_fromParse.describe
                                   }   
                    }
                    messages[index] = msg_obj;
                }
                index++;
            } 
            if(node.checkbox7_VPN_Up === true) {
                if( topic === '/system/event/event_vpn_up') {
                    let msg_obj = {
                        "topic": topic,
                        "payload": {
                                    "gatewayID": message_fromParse.gatewayID,
                                    "type": message_fromParse.type,
                                    "describe": message_fromParse.describe
                                   }   
                    }
                    messages[index] = msg_obj;
                }
                index++;
            } 
            if(node.checkbox8_VPN_Down === true) {
                if( topic === '/system/event/event_vpn_down') {
                    let msg_obj = {
                        "topic": topic,
                        "payload": {
                                    "gatewayID": message_fromParse.gatewayID,
                                    "type": message_fromParse.type,
                                    "describe": message_fromParse.describe
                                   }   
                    }
                    messages[index] = msg_obj;
                }
                index++;
            } 

            node.send(messages);
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
    RED.nodes.registerType("GW Events", gatewayEvent);
}
