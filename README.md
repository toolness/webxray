These are Web X-Ray Goggles, which provide a simple, easy way for non-technical people to inspect Web pages and learn about how they are put together.

To play with the current version of the goggles, check out [https://secure.toolness.com/webxray/][].

## Build System

The build system for Web X-Ray Goggles was inspired by jQuery. In fact, Web X-Ray Goggles are, in some sense, just a custom build of jQuery. The `src` directory contains files that will ultimately be concatenated or "compiled" into a single JavaScript file, and the `static-files` directory contains standalone files used by the goggles.

## Prerequisites

To develop the goggles, you'll need:

* git
* python

## Installation

First, check out the `webxray` repository:

    git clone https://github.com/toolness/webxray.git

To start a web server that dynamically serves the Web X-Ray Goggles bookmarklet and unit tests, run:

    python go.py serve

Alternatively, if you want to compile the `static-files/webxray.js` file, run:

    python go.py compile

  [https://secure.toolness.com/webxray/]: https://secure.toolness.com/webxray/

## Configuration

The *Compose A Replacement* dialog used by the goggles is actually in a
separate repository, and it's designed to be hosted on a separate domain for
security purposes.

By default, the goggles are configured to load the dialog at its official
location. If you'd like to host your own dialog, though, you can:

  1. Clone the [mix-master-dialog][] repository and follow its setup
  instructions.

  2. In the `webxray` repository, create a new file called
  `src/settings.local.js`. Assuming your hosted instance of the dialog is at
  http://127.0.0.1:8002/, and fill it with this:

        jQuery.webxraySettings.extend({
          mixMasterDialogURL: "http://127.0.0.1:8002/"
        });

[mix-master-dialog]: https://github.com/hackasaurus/mix-master-dialog

## Reporting Bugs

If you have any bugs to report, please file them in [Lighthouse][].

  [Lighthouse]: http://hackasaurus.lighthouseapp.com/projects/66492-hackasaurus/

## Updating JQuery

Currently, the goggles build on JQuery 1.5. To update the repository's files to use a different version of JQuery, check out the [webxray-stable][] branch of JQuery and run the `export_to_webxray.py` script.

  [webxray-stable]: https://github.com/toolness/jquery/tree/webxray-stable

## LICENSE

All files that are part of this project are covered by the following
license, except where explicitly noted.

    Version: MPL 1.1/GPL 2.0/LGPL 2.1

    The contents of this file are subject to the Mozilla Public License Version
    1.1 (the "License"); you may not use this file except in compliance with
    the License. You may obtain a copy of the License at
    http://www.mozilla.org/MPL/

    Software distributed under the License is distributed on an "AS IS" basis,
    WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
    for the specific language governing rights and limitations under the
    License.

    The Original Code is webxray.

    The Initial Developer of the Original Code is the Mozilla Foundation.

    Portions created by the Initial Developer are Copyright (C) 2010
    the Initial Developer. All Rights Reserved.

    Contributor(s):

    Alternatively, the contents of this file may be used under the terms of
    either the GNU General Public License Version 2 or later (the "GPL"), or
    the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
    in which case the provisions of the GPL or the LGPL are applicable instead
    of those above. If you wish to allow use of your version of this file only
    under the terms of either the GPL or the LGPL, and not to allow others to
    use your version of this file under the terms of the MPL, indicate your
    decision by deleting the provisions above and replace them with the notice
    and other provisions required by the GPL or the LGPL. If you do not delete
    the provisions above, a recipient may use your version of this file under
    the terms of any one of the MPL, the GPL or the LGPL.
