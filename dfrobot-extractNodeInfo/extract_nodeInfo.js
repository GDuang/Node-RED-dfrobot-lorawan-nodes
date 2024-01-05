module.exports = function(RED) {
    function ExtractNodeInfo(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // 保存配置中选择的字段
        node.rules = {
            rssi: config.checkbox1_RSSI,
            snr: config.checkbox2_SNR,
            dr: config.checkbox3_DR,
            devEUI: config.checkbox4_devEUI,
            // data: config.checkbox9_data,
            fCnt: config.checkbox5_fCnt,
            deviceName: config.checkbox6_deviceName,
            applicationID: config.checkbox7_applicationID,
            devAddr: config.checkbox8_devAddr
        };

        // Node在输入事件上注册一个侦听器，以接收来自流中上游Node的消息
        node.on('input', function(msg) {
            // 创建一个空对象来保存提取的属性。
            var extractedData = {};


            // 解析输入的消息payload（假定其为JSON字符串）
            const payload = msg.payload;


            // 如果选中了相应的复选框，则提取属性
            if (node.rules.rssi) extractedData.RSSI = payload.rxInfo[0].rssi;
            if (node.rules.snr) extractedData.SNR = payload.rxInfo[0].loRaSNR;
            if (node.rules.dr) extractedData.DR = payload.dr;
            if (node.rules.devEUI) extractedData.devEUI = payload.devEUI;
            // if (node.rules.data) {
            //     if (payload.hasOwnProperty('ParsedData')) {
            //         if(payload.ParsedData.data.ASCIIstring != null) {
            //             extractedData.data = payload.ParsedData.data.ASCIIstring;
            //         } else {
            //             extractedData.data = payload.data;
            //         }
            //     } else {
            //         extractedData.data = payload.data;
            //     }
            // }
            if (node.rules.fCnt) extractedData.fCnt = payload.fCnt;
            if (node.rules.deviceName) extractedData.deviceName = payload.deviceName;
            if (node.rules.applicationID) extractedData.applicationID = payload.applicationID;
            if (node.rules.devAddr) extractedData.devAddr = payload.devAddr;

            // 输出提取的数据
            msg.payload = extractedData;
            node.send(msg);
        });
    }

    // 用名称“Extract Info”和配置注册节点
    RED.nodes.registerType("Packet Item", ExtractNodeInfo);
}
