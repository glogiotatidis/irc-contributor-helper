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


function fetchBugs(channel, product, component) {
    var searchTerms = {'status_whiteboard': 'mentor',
                       'whiteboard_type': 'contains_all',
                       'product': product,
                       'component': component,
                       'bug_status': 'NEW'};

    bzClient.searchBugs(searchTerms, function   (errors, bugs) {
        var bug, index;
        for (index in bugs) {
            bug = bugs[index];
            ircClient.say(channel, 'bug ' + bug.id);
        }
    });
}

// via https://github.com/mythmon/standup-irc/blob/master/standup-irc.js
// Connected to IRC server
ircClient.on('registered', function(message) {
    console.log('Connected to IRC server.');
    // Store the nickname assigned by the server
    config.realNick = message.args[0];
    console.info('Using nickname: ' + config.realNick);
});



ircClient.on('message', function(user, channel, message) {
    if (message === '!bug') {
        var msg = (', ! commands are deprecated. Directly speak to me for help. ' +
                   'Example: \n' + config.realNick + ', bugs');
        ircClient.say(channel, msg);
    }
});

function showHelp(user, channel, cmd) {
    var helpMessage = ('Here is a list of supported commands:\n' +
                       ' - help: This message\n' +
                       ' - docs [project]: Documentation for project\n' +
                       ' - bugs [project]: Mentored bugs for project\n');
    say(user, user, helpMessage);
}

function showDocs(user, channel, cmd) {
    // TODO if channel not in ircChannels
    say(channel, user, ircChannels[channel].documentationMessage);
}

function say(destination, user, message) {
    var message = user + ', ' + message;
    ircClient.say(destination, message);
}

ircClient.on('message', function(user, channel, message) {
    var cmdRe = new RegExp('^' + config.realNick + '[:,]? +(.*)$', 'i');
    var match = cmdRe.exec(message);
    if (match) {
        var cmd = match[1].trim();
        switch (cmd) {
          case 'ping':
            say(channel, user, 'yo!');
            break;
          case 'sup?':
            say(channel, user,  'just chilling, you?');
            break;
          case 'bugs':
            fetchBugs2(user, channel, cmd);
            break;
          case 'documentation':
          case 'doc':
          case 'docs':
            showDocs(user, channel, cmd);
            break;
          case 'help':
            showHelp(user, channel, cmd);
            break;
          default:
            say(channel, user, 'wat?');
        }
    }
});


function fetchBugs2(user, channel, command) {

};
