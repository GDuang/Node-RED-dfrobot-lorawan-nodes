module.exports = function(RED) {
    function GroupAndFilterNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        // 配置信息从Node-RED编辑器中获取
        node.rules = config.rules;
        node.OutputMode = config.OutputMode;


        // 节点在事件上注册一个侦听器，以接收来自 流中的上游节点。input
        node.on('input', function(msg, send, done) {

            if(!msg.hasOwnProperty('payload')){
                return;
            }

            // 解析输入的消息payload（假定其为JSON字符串）
            const payload = msg.payload;

            // 准备一个数组来存储将要发送的消息(rules数组长度对应输出端口数量)
            var messages = new Array(node.rules.length);
            if (!Array.isArray(node.rules)) {
                return;
            }



            // 遍历所有的规则————遍历过程中获取到每个元素的值（rule）和索引（index)         
            node.rules.some(function(rule, index) {
                // 检查规则中的下拉列表值是否为所选择的选项
                if (node.rules[index].type === "devEUI") {
                    let tmep_index = 0;
                    // 遍历当前分路的所有devEUI的值，将指定devEUI的节点从该分路输出
                    node.rules[index].properties.forEach((property, i)=>{
                        // 1)保证负载中有下拉选项中的选项字段   2)保证给选项赋了property属性
                        if (property !== undefined && property !== null && msg.payload.hasOwnProperty('devEUI')) {
                            if(property.toLowerCase() === msg.payload.devEUI.toLowerCase()) {
                                messages[index] = RED.util.cloneMessage(msg);
                                tmep_index += 1;
                            }
                        }
                    });
                    if (node.OutputMode === "option_Mode2" && tmep_index > 0) {
                        return true;
                    }
                } else if (node.rules[index].type === "deviceName") {
                    let tmep_index = 0;
                    node.rules[index].properties.forEach((property, i)=>{
                        if (property !== undefined && property !== null && msg.payload.hasOwnProperty('deviceName')) {
                            if(property.toLowerCase() === msg.payload.deviceName.toLowerCase()) {
                                messages[index] = RED.util.cloneMessage(msg);
                                tmep_index += 1;
                            }
                        }
                    });
                    if (node.OutputMode === "option_Mode2" && tmep_index > 0) { 
                        return true;
                    }
                } else if (node.rules[index].type === "applicationID") {
                    let tmep_index = 0;
                    node.rules[index].properties.forEach((property, i)=>{
                        if (property !== undefined && property !== null && msg.payload.hasOwnProperty('applicationID')) {
                            if(property === msg.payload.applicationID) {
                                messages[index] = RED.util.cloneMessage(msg);
                                tmep_index += 1;
                            }
                        }
                    });
                    if (node.OutputMode === "option_Mode2" && tmep_index > 0) {
                        return true;
                    }
                } else if (node.rules[index].type === "devAddr") {
                    let tmep_index = 0;
                    node.rules[index].properties.forEach((property, i)=>{
                        if (property !== undefined && property !== null && msg.payload.hasOwnProperty('devAddr')) {
                            if(property.toLowerCase() === msg.payload.devAddr.toLowerCase()) {
                                messages[index] = RED.util.cloneMessage(msg);
                                tmep_index += 1;
                            }
                        }
                    });
                    if (node.OutputMode === "option_Mode2" && tmep_index > 0) {
                        return true;
                    }
                }
            });

            // 发送消息数组到多个输出
            send(messages);

            // 调用 done 表示处理完成
            done();
        });
    }

    // 注册节点类型
    RED.nodes.registerType("Group", GroupAndFilterNode);
};



