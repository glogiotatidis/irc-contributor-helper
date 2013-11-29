'use strict';

var IRC = require('irc');
var bz = require('bz');
var nconf = require('nconf');

nconf.file({ file: './local.json'}).defaults({
    PORT: 3000,
    nick: 'contributor-helper',
    dev: false
}).argv().env();

var config = nconf.get();
var registeredCommands = new Array();

var ircChannels = require('./irc_channels.json');
if ( config.dev ) {
  ircChannels = require('./irc_channels_dev.json');
}


var ircClient = new IRC.Client('irc.mozilla.org', config.nick, {
    secure: true,
    port: 6697,
    userName: config.nick,
    realName: 'The friendly contributor helper',
    channels: Object.keys(ircChannels)
});


var bzClient = bz.createClient({
    url: 'https://api-dev.bugzilla.mozilla.org/latest/'
});


var Command = (function(cmdRe, execute) {
    this.cmdRe = cmdRe;
    this.execute = execute;
    registeredCommands.push(this);
});

Command.prototype.match = function(message) {
    if (this.cmdRe.exec(message)) {
        return true;
    }
    return false;
};


// via https://github.com/mythmon/standup-irc/blob/master/standup-irc.js
// Connected to IRC server
ircClient.on('registered', function(message) {
    console.log('Connected to IRC server.');
    // Store the nickname assigned by the server
    config.realNick = message.args[0];
    console.info('Using nickname: ' + config.realNick);
});


var showHelp = new Command(
    new RegExp('^help', 'i'),
    function(user, channel, cmd) {
        var helpMessage = ('Here is a list of supported commands:\n' +
                           ' - help: This message\n' +
                           ' - docs [project]: Documentation for project\n' +
                           ' - bugs [project]: Mentored bugs for project\n');
        say(user, user, helpMessage);
    }
);

var showDocs = new Command(
    new RegExp('^(documentation|docs|doc)', 'i'),
    function(user, channel, cmd) {
        say(channel, user, ircChannels[channel].documentationMessage);
    }
);

var Ping = new Command(
    new RegExp('^ping', 'i'),
    function (user, channel, cmd) {
        say(channel, user, 'pong');
    }
);

var Sup = new Command(
    new RegExp('^sup', 'i'),
    function(user, channel, cmd) {
        say(channel, user, 'just chilling, you?');
    }
);

var fetchBugs = new Command(
    new RegExp('^bugs?', 'i'),
    function(user, channel, cmd) {

        var searchTerms = {'status_whiteboard': 'mentor',
                           'whiteboard_type': 'contains_all',
                           'product': ircChannels[channel].product,
                           'component': ircChannels[channel].component,
                           'bug_status': 'NEW'};

        bzClient.searchBugs(searchTerms, function (errors, bugs) {
            var bug, index;
            for (index in bugs) {
                bug = bugs[index];
                say(channel, user, 'bug ' + bug.id);
            }
        });
    }
);

function say(destination, user, message) {
    var message = user + ', ' + message;
    ircClient.say(destination, message);
}

ircClient.on('message', function(user, channel, message) {
    var regex = new RegExp('^' + config.realNick + '[:,]?');
    var command = message.split(regex)[1].trim();

    if (command) {
        for (var i=0; i < registeredCommands.length; i++) {
            if (registeredCommands[i].match(command)) {
                registeredCommands[i].execute(user, channel, command);
            }
        }
        if (i === registeredCommands.length + 1) {
            say(channel, user, 'wat?');
        }
    }
});
