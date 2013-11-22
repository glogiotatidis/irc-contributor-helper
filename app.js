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
ircClient.on('registrered', function(message) {
    console.log('Connected to IRC server.');
    // Store the nickname assigned by the server
    config.realNick = message.args[0];
    console.info('Using nickname: ' + config.realNick);
});


ircClient.on('message', function(user, channel, message) {
    if (message === '!bug') {
        ircClient.say(channel, 'Looking for bugs...');
        fetchBugs(channel, ircChannels[channel].product, ircChannels[channel].component);
    }
});

ircClient.on('message', function(user, channel, message) {
    var command = message.split(' ')[0];
    if (command === '!doc') {
        var userMentioned = message.split(' ')[1];
        var message = ((userMentioned || user) + (ircChannels[channel].documentationMessage ||
                       ' to find the documentation for web dev projects you can visit '+
                       'https://wiki.mozilla.org/Webdev/GetInvolved'));
        ircClient.say(channel, message);
    }
});
