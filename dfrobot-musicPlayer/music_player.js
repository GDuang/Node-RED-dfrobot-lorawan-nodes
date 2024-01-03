
module.exports = function(RED) {
    function PlaySoundNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var exec = require('child_process').exec;

        node.on('input', function(msg) {
            var selectedOption = config._Built_in_file_opts;
 

            msg.payload = {res: ""};

            var command = `mpg123 -o alsa:hw:1,0 ${config._Built_in_file_opts}`;


            exec(command, function(error, stdout, stderr) {
                if (error) {
                    // node.error("Error playing sound: " + error);
                }
            });
        });
    }
    RED.nodes.registerType("MusicPlayer", PlaySoundNode);
}
