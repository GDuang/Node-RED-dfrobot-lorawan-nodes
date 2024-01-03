function rs485Analysis(obj, cmdnum, index, binaryData) {
    var rs485statusmask = binaryData[index];
    index++;
    // console.log("rs485statusmask = "+rs485statusmask)
    
    // ...,0x03,0x00,0x00,(rs485指令1的data),0x18,(rs485指令2的data),...        但实际上0x03,0x00,0x00,0x18（需要跟踪）

    // console.log("(rs485statusmask & 0x18) != 0x18——>" + ((rs485statusmask & 0x18) != 0x18))
    let target_bit3_5 = (rs485statusmask >> 3) & 0b00000111;
    let target_bits0_2 = rs485statusmask & 0b00000111;
    if (target_bit3_5 === 0b000 && (target_bits0_2 === 0b000 || target_bits0_2 === 0b001)) {
        return index;
    } else if (target_bit3_5 === 0b000 && target_bits0_2 ===0b010) {
        // console.log("bit3-5为000");
        obj.rs485["cmd" + cmdnum] = (binaryData[index] << 8) + binaryData[index + 1];
        index += 2;
    } else if (target_bit3_5 === 0b001 && target_bits0_2 ===0b100) {
        obj.rs485["cmd" + cmdnum] = (binaryData[index] << 24) + (binaryData[index + 1] << 16) + (binaryData[index + 2] << 8) + binaryData[index + 3];
        index += 4;
        // console.log("bit3-5为001");
    } else if (target_bit3_5 === 0b010 && target_bits0_2 ===0b100) {
        obj.rs485["cmd" + cmdnum] = (binaryData[index] << 24) + (binaryData[index + 1] << 16) + (binaryData[index + 2] << 8) + binaryData[index + 3];
        index += 4;
        // console.log("bit3-5为010");
    } else if (target_bit3_5 === 0b011) {
        obj.rs485["cmd" + cmdnum] = "config error";
        // console.log("bit3-5为011");
    } else {
        // console.log("bit3-5不是000、001、010或011");
    }
    
    return index;
}








function bin2HexStr(arr) {
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        var tmp = arr[i].toString(16);
        if (tmp.length == 1) {
            tmp = "0" + tmp;
        }
        tmp = "0x" + tmp;
        if (i != arr.length - 1) {
            tmp += ",";
        }
        str += tmp;
    }
    return str;
}

function Decode(payload) {
    var binaryData = payload;
    var index = 0;
    var object = {
        adc: {},
        iocnt: {},
        ioin: {},
        ioout: {},
        rs485: {},
        battery: {},
        date: {},
        data: {},
    }
    var results = [];
    // 解码原始数据

    
    var payloadJson = payload;

    // 解码Base64字符串并返回一个包含二进制数据的Buffer对象
    var binaryData = Buffer.from(payloadJson.data, 'base64');
    // 将二进制buffer转化为16进制字符串
    object.data._Base64 = payloadJson.data;
    object.data._Buffer = binaryData;

    // console.log(`${payload} + ${binaryData} + ${payloadJson.data}`) // 这些数据正常

    var index = 0;  //二进制数组索引（步长为1字节）

    var adcmask = binaryData[index];

    index++;

    for (var i = 0; i < 4; i++) {   //判断adc开启状态
        if ((adcmask & 0x01) === 1) {

            switch (i) {
                case 0:
                    object.adc.ADC0 = binaryData[index] + (binaryData[index + 1] << 8);
                    index += 2;
                    break;
                case 1:
                    object.adc.ADC1 = binaryData[index] + (binaryData[index + 1] << 8);
                    index += 2;
                    break;
                case 2:
                    object.adc.ADC2 = binaryData[index] + (binaryData[index + 1] << 8);
                    index += 2;
                    break;
                case 3:
                    object.adc.ADC3 = binaryData[index] + (binaryData[index + 1] << 8);
                    index += 2;
                    break;
            }
        }
        adcmask >>= 1;
    }

    var iocntmask = binaryData[index];
    index++;

    for (var i = 0; i < 4; i++) {    //判断iocnt使能状态
        if ((iocntmask & 0x01) == 1) {
            switch (i) {
                case 0:
                    object.iocnt.io0 = binaryData[index] + (binaryData[index + 1] << 8) + (binaryData[index + 2] << 16) + ((binaryData[index + 3] << 24) >>> 0);
                    index += 4;
                    break;
                case 1:
                    object.iocnt.io1 = binaryData[index] + (binaryData[index + 1] << 8) + (binaryData[index + 2] << 16) + ((binaryData[index + 3] << 24) >>> 0);
                    index += 4;
                    break;
                case 2:
                    object.iocnt.io2 = binaryData[index] + (binaryData[index + 1] << 8) + (binaryData[index + 2] << 16) + ((binaryData[index + 3] << 24) >>> 0);
                    index += 4;
                    break;
                case 3:
                    object.iocnt.io3 = binaryData[index] + (binaryData[index + 1] << 8) + (binaryData[index + 2] << 16) + ((binaryData[index + 3] << 24) >>> 0);
                    index += 4;
                    break;
            }
        }
        iocntmask >>= 1;
    }

    var iostatusmask = binaryData[index];
    index++;

    if (iostatusmask != 0) {    //判断io使能状态
        var iostatus = binaryData[index];
        index++;
        for (var i = 0; i < 8; i++) {
            if ((iostatusmask & 0x01) == 1) {
                switch (i) {
                    case 0:
                        if (iostatus & 0x01 == 1) {
                            object.ioin.io0 = "HIGH";
                        } else {
                            object.ioin.io0 = "LOW";
                        }
                        break;
                    case 1:
                        if ((iostatus >> 1) & 0x01 == 1) {
                            object.ioin.io1 = "HIGH";
                        } else {
                            object.ioin.io1 = "LOW";
                        }
                        break;
                    case 2:
                        if ((iostatus >> 2) & 0x01 == 1) {
                            object.ioin.io2 = "HIGH";
                        } else {
                            object.ioin.io2 = "LOW";
                        }
                        break;
                    case 3:
                        if ((iostatus >> 3) & 0x01 == 1) {
                            object.ioin.io3 = "HIGH";
                        } else {
                            object.ioin.io3 = "LOW";
                        }
                        break;
                    case 4:
                        if ((iostatus >> 4) & 0x01 == 1) {
                            object.ioout.io0 = "HIGH";
                        } else {
                            object.ioout.io0 = "LOW";
                        }
                        break;
                    case 5:
                        if ((iostatus >> 5) & 0x01 == 1) {
                            object.ioout.io1 = "HIGH";
                        } else {
                            object.ioout.io1 = "LOW";
                        }
                        break;
                    case 6:
                        if ((iostatus >> 6) & 0x01 == 1) {
                            object.ioout.io2 = "HIGH";
                        } else {
                            object.ioout.io2 = "LOW";
                        }
                        break;
                    case 7:
                        if ((iostatus >> 7) & 0x01 == 1) {
                            object.ioout.io3 = "HIGH";
                        } else {
                            object.ioout.io3 = "LOW";
                        }
                        break;
                    default:
                        break;
                }
            }
            iostatusmask >>= 1;
        }
    }

    var rs485mask = binaryData[index] + (binaryData[index + 1] << 8);
    index += 2;
    // console.log("-----------------------")
    // console.log("rs485mask = " + rs485mask)
    // console.log("binaryData = " + bin2HexStr(binaryData))

    for (var i = 0; i < 16; i++) {   //判断rs485使能状态
        if ((rs485mask & 0x0001) == 1) {
            // console.log("i = "+i)
            // console.log("rs485mask & 0x0001 = " + (rs485mask & 0x0001))
            // console.log("index = "+index)
            switch (i) {
                case 0:
                    index = rs485Analysis(object, "0", index, binaryData);
                    break;
                case 1:
                    index = rs485Analysis(object, "1", index, binaryData);
                    break;
                case 2:
                    index = rs485Analysis(object, "2", index, binaryData);
                    break;
                case 3:
                    index = rs485Analysis(object, "3", index, binaryData);
                    break;
                case 4:
                    index = rs485Analysis(object, "4", index, binaryData);
                    break;
                case 5:
                    index = rs485Analysis(object, "5", index, binaryData);
                    break;
                case 6:
                    index = rs485Analysis(object, "6", index, binaryData);
                    break;
                case 7:
                    index = rs485Analysis(object, "7", index, binaryData);
                    break;
                default:
                    break;
            }
        }
        rs485mask >>= 1;
    }

    var batterymask = binaryData[index];

    index++;

    for (var i = 0; i < 2; i++) {  //判断使能电池电量或者是时间戳
        if ((batterymask & 0x01) == 1) {
            switch (i) {
                case 0:
                    object.battery.level = binaryData[index];
                    index++;
                    break;
                case 1:
                    var data = binaryData[index] + (binaryData[index + 1] << 8) + (binaryData[index + 2] << 16) + ((binaryData[index + 3] << 24) >>> 0);
                    var unixEpochTimestamp = data * 1000;

                    // 创建一个Date对象并传入时间戳
                    var date = new Date(unixEpochTimestamp);
                    var dateString = date.toLocaleString();
                    var formattedDateStr = dateString.replace(/\//g, ':');
                    object.date.date = formattedDateStr;
                    index += 4;
                    break;
                default:
                    break;
            }
        }
        batterymask >>= 1;
    }


    //若没有开启的类别则从json对象中删除不显示
    if (Object.keys(object.adc).length === 0) {
        delete object.adc;
    }
    if (Object.keys(object.iocnt).length === 0) {
        delete object.iocnt;
    }
    if (Object.keys(object.ioin).length === 0) {
        delete object.ioin;
    }
    if (Object.keys(object.ioout).length === 0) {
        delete object.ioout;
    }
    if (Object.keys(object.rs485).length === 0) {
        delete object.rs485;
    }
    if (Object.keys(object.battery).length === 0) {
        // 每次采集数据都会有电池包，如果本次没有电池包就说明此次数据为 正好误解析的部分数据
        delete object.battery;
        results = [object, payloadJson.data, false];    // 解码失败
        return results;
    }
    if (Object.keys(object.date).length === 0) {
        delete object.date;
    }

    console.log("binaryData.length = " + binaryData.length + ", index = " + index)
    if (binaryData.length > index) {
        results = [object, payloadJson.data, false];    // 解码失败
        return results;
    }

    // results[解码成功的数据，原始数据，解码是否成功]
    results = [object, payloadJson.data, true];         // 解码成功

    return results;
}

function subscriptionHandler(payload_data, decode) {

    if(decode &&decode.includes("Decode")){
        try{
            eval(decode)
            if(typeof payload_data === 'string'){
                return dataInfo = Decode(payload_data)
            }else{
                return dataInfo = Decode(JSON.stringify(payload_data))
            }
        }catch(e){
            return dataInfo = payload_data;
        } v   
    }else{
        return dataInfo = payload_data;
    }
}




module.exports = function(RED) {
    function decoderNodeInfo(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // 配置信息从Node-RED编辑器中获取
        node.rules = config.rules;
        node.OutputMode = config.OutputMode

        node.decodeText = config.decodeText;



        // Node在输入事件上注册一个侦听器，以接收来自流中上游Node的消息
        node.on('input',  function(msg, send, done) {
 
            // 1、保证负载中有data字段
            if (!msg.payload.hasOwnProperty('data')) {
                node.error("ERROR: 负载payload中无data字段");
                return;
            }

            if (msg.payload.data === null || msg.payload.data === undefined) {
                return;
            }

            var msg_payload = msg.payload;
            var msg_payload_data = msg.payload.data;

            // console.log(node.decodeText)

            if (!Array.isArray(node.rules)) {
                return;
            }

            // 准备一个数组来存储将要发送的消息(rules数组长度对应输出端口数量)
            var messages_stream = new Array(node.rules.length);
            


            // 遍历所有的规则————遍历过程中获取到每个元素的值（rule）和索引（index)
            node.rules.some(function(rule, index) {
                // 检查规则中的下拉列表值是否为所选择的选项
                if (node.rules[index].type === "option1") {

                    // 处理解码器内部解码函数    
                    messages = RED.util.cloneMessage(msg);
                    messages.payload = {data: ""};

                    let res_data = Decode(msg_payload);

                    // 解码成功——>返回解码后的数据
                    if (res_data[2] === true) {
                        messages.payload.data = res_data[0]
                        messages_stream[index] = messages;
                        
                        if (node.OutputMode == "option_Mode2") {
                            return true;
                        }
                        
                    } else if (res_data[2] === false) {
                        // messages.payload.data = "解码失败"
                        messages_stream[index] = null;
                        // node.send([null, messages1]);
                    }
                    
                } else if (node.rules[index].type === "option2") {

                    messages1 = RED.util.cloneMessage(msg);
                    messages2 = RED.util.cloneMessage(msg);
    
                    messages2.payload = {data: msg_payload_data};
                    messages1.payload = {data: {_String: null, _Buffer: null}};
                    

                    // messages2.payload.data是一个base64编码的字符串
                    var base64Data = messages2.payload.data;
                    // 将base64编码的字符串转换为Buffer对象
                    var binaryDataBuffer = Buffer.from(base64Data, 'base64');
                    
                    messages1.payload.data._String = binaryDataBuffer.toString('ascii');
                    messages1.payload.data._Buffer = binaryDataBuffer;

                    messages_stream[index] = messages1;
                    if (node.OutputMode == "option_Mode2") {
                        return true;
                    }
                } else if (node.rules[index].type === "option3") {
                    if(config.decodeText &&config.decodeText.includes("Decode")){
                        messages_CustomScripts = RED.util.cloneMessage(msg);
                        messages_CustomScripts.payload = {data: ""};
                        messages_CustomScripts.payload.data = subscriptionHandler(msg_payload_data, config.decodeText);
                        messages_stream[index] = messages_CustomScripts;
                        if (node.OutputMode == "option_Mode2") {
                            return true;
                        }
                    }
                }
            });

            // 发送消息数组到多个输出
            send(messages_stream);

            // 调用 done 表示处理完成
            done();
        });
    }

    RED.nodes.registerType("Decoder", decoderNodeInfo);
}
