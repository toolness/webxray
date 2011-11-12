"""
    usage: go.py <command>
    
    commands:
    
      serve       - run web server on 127.0.0.1 port %(port)s
      globalserve - run web server on all IP interfaces port %(port)s
      compile     - generate %(compiledFilename)s
      clean       - delete all generated files
"""

from wsgiref.simple_server import make_server
from wsgiref.util import FileWrapper
import os
import sys
import shutil
import glob
import time
import mimetypes

try:
    import json
except ImportError:
    import simplejson as json

ROOT = os.path.abspath(os.path.dirname(__file__))
JS_TYPE = 'application/javascript; charset=utf-8'

path = lambda *x: os.path.join(ROOT, *x)
locale_dir = path('locale')
locale_domain = 'webxray'

sys.path.append(path('vendor'))

import localization

def get_git_commit():
    try:
        head = open(path('.git', 'HEAD'), 'r').read()
        if head.startswith('ref: '):
            ref = open(path('.git', head.split()[1].strip()), 'r').read()
            return ref.strip()
        return head.strip()
    except Exception:
        return "unknown"

def build_compiled_file(cfg):
    metadata = json.dumps(dict(commit=get_git_commit(),
                               date=time.ctime()))
    contents = []
    for path in cfg['compiledFileParts']:
        if '.local.' in path:
            if not os.path.exists(path):
                continue
        if '*' in path:
            filenames = glob.glob(path)
        else:
            filenames = [path]
        for filename in filenames:
            data = open(filename, 'r').read()
            data = data.replace('__BUILD_METADATA__', metadata)
            contents.append(data)
    return ''.join(contents)

def make_app(cfg):
    def app(environ, start_response):
        path = environ['PATH_INFO']

        if path == cfg['compiledFile']:
            compiled = build_compiled_file(cfg)
            start_response('200 OK',
                           [('Content-Type', JS_TYPE),
                            ('Content-Length', str(len(compiled)))])
            return [compiled]
        
        if path.endswith('/'):
            path = '%sindex.html' % path
        fileparts = path[1:].split('/')
        fullpath = os.path.join(ROOT, cfg['staticFilesDir'], *fileparts)
        fullpath = os.path.normpath(fullpath)
        (mimetype, encoding) = mimetypes.guess_type(fullpath)
        if (fullpath.startswith(ROOT) and
            not '.git' in fullpath and
            os.path.isfile(fullpath) and
            mimetype):
            filesize = os.stat(fullpath).st_size
            start_response('200 OK', [('Content-Type', mimetype),
                                      ('Content-Length', str(filesize))])
            return FileWrapper(open(fullpath, 'rb'))

        start_response('404 Not Found', [('Content-Type', 'text/plain')])
        return ['Not Found: ', path]

    return app

def serve(cfg, ip=''):
    ipstr = ip
    if not ipstr:
        ipstr = 'all IP interfaces'
    server = make_server(ip, cfg['port'], make_app(cfg))
    print "serving on %s port %d" % (ipstr, cfg['port'])
    server.serve_forever()

if __name__ == "__main__":
    cfg = json.loads(open('config.json', 'r').read())
    cfg['compiledFilename'] = cfg['staticFilesDir'] + cfg['compiledFile']

    if len(sys.argv) < 2:
        print __doc__ % cfg
        sys.exit(1)

    cmd = sys.argv[1]
    
    if cmd == 'serve':
        serve(cfg, '127.0.0.1')
    elif cmd == 'globalserve':
        serve(cfg)
    elif cmd == 'compilemessages':
        localization.compilemessages(json_dir=path(cfg['staticFilesDir']),
                                     js_locale_dir=path('src', 'locale'),
                                     default_locale='en',
                                     locale_dir=locale_dir,
                                     locale_domain=locale_domain)
    elif cmd == 'makemessages':
        locale = None
        if len(sys.argv) > 2:
            locale = sys.argv[2]
        localization.makemessages(babel_ini_file=path('babel.ini'),
                                  json_dir=path(cfg['staticFilesDir']),
                                  locale_dir=locale_dir,
                                  locale_domain=locale_domain,
                                  locale=locale)
    elif cmd == 'compile':
        f = open(cfg['compiledFilename'], 'w')
        f.write(build_compiled_file(cfg))
        f.close()
        print "wrote %s" % cfg['compiledFilename']
    elif cmd == 'clean':
        if os.path.exists(cfg['compiledFilename']):
            os.remove(cfg['compiledFilename'])
        print "removed generated files."
    else:
        print "unknown command: %s" % cmd
        sys.exit(1)
