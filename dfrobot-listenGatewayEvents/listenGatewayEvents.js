

module.exports = function(RED) {
    function ExampleNode(config) {
        // RED.nodes.createNode(this, config);
        // var node = this;
        // node.name = config.name;
        // node.checkbox1 = config.checkbox1;
        // node.checkbox2 = config.checkbox2;
        // node.checkbox3 = config.checkbox3;

        // node.on('input', function(msg) {
        //     // 处理输入消息并准备输出消息
        //     var outputMsg = { 
        //         payload: "Name: " + node.name + ", " +
        //         "Type 1: " + (node.checkbox1 ? "Enabled" : "Disabled") + ", " +
        //         "Type 2: " + (node.checkbox2 ? "Enabled" : "Disabled") + ", " +
        //         "Type 3: " + (node.checkbox3 ? "Enabled" : "Disabled")
        //     };
        //     node.send(outputMsg);
        // });
    }
    RED.nodes.registerType("GW Events", ExampleNode);
}
