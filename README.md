Mozilla's IRC Contributor Helper
================================

A bot to help contributors to find mentored bugs of their interest.

The bot hangs out on irc.mozilla.org in supported channels, usually
with the inspired ircname 'contributor-helper'. You will find
contributor-helper in #commtools (mozillians.org project channel) and
in #remo-dev (reps.mozilla.org project channel) at least.


Supported commands
------------------

Here is a basic list of the supported commands. You can get the latest
list of supported commands by typing:

  contributor-helper, help

in a supported IRC channel.

 1. help: Get a list of supported commands and help for each one of
    them.

 2. doc: Get a link to documentation for the project related to the
    channel.

    Similar commands:
        docs, documentation

 3. bug: Get a list of mentored bugs for the project related to the
    channel.

    Examples:

        1. contributor-helper, bug # will return all mentored bugs for project
        2. contributor-helper, bug lang=python # return all mentored bugs with lang=python in whiteboard
        3. contributor-helper, but python difficulty=1/3 # return all easy python, mentored bugs

    Similar commands:
        bugs


Marking your bugs
-----------------

contributor-helper looks for bugs that are *NEW*, *unassigned* and
have the word *mentor* in the whiteboard. For example bug
<https://bugzilla.mozilla.org/show_bug.cgi?id=703316> includes the
string '[difficulty=2/3][lang=python][mentor=giorgos@mozilla.com]' in
the whiteboard and for as long as it stays *NEW*, contributor-helper
will return it when asked for bugs in #commtools.


Contribute
==========

Add support for your project.
-----------------------------

You only need to change *irc_channels.json* and fill in all *product*,
*component* and *documentationMessage* items. Then send a pull request
with your changes.


File an issue.
--------------

irc-contributor-helper uses GitHub Issues for bug tracking and feature
requests. Go wild!


Send code.
----------

Pull requests welcome. Everyone gets a cake!
