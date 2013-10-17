'use strict';

var IRC = require('irc');
var bz = require('bz');
var nconf = require('nconf');
var ircChannels = require('./irc_channels.json');

nconf.defaults({
  nick: 'contributor-helper',
}).argv().env();

var config = nconf.get();

var ircClient = new IRC.Client('irc.mozilla.org', config.nick, {
  secure: true,
  port: 6697,
  userName: config.nick,
  realName: 'The friendly contributor helper',
  channels: Object.keys(ircChannels)
})

var bzClient = bz.createClient({
  url: 'https://api-dev.bugzilla.mozilla.org/latest/'
});


function fetchBugs(channel, product, component) {
  var searchTerms = {'status_whiteboard': 'mentor',
                     'whiteboard_type': 'contains_all',
                     'product': product,
                     'component': component,
                     'bug_status': 'NEW'}

  console.log(searchTerms);
  bzClient.searchBugs(searchTerms, function(errors, bugs) {
    var bug;
    for (var index in bugs) {
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
