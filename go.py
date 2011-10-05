"""
    usage: go.py <command>
    
    commands:
    
      serve   - run web server on port %(port)s
      compile - generate %(compiledFilename)s
      clean   - delete all generated files
"""

from wsgiref.simple_server import make_server
from wsgiref.util import FileWrapper
import os
import sys
import shutil
import glob
import mimetypes

try:
    import json
except ImportError:
    import simplejson as json

ROOT = os.path.abspath(os.path.dirname(__file__))

def build_compiled_file(cfg):
    contents = []
    for path in cfg['compiledFileParts']:
        if '.local.' in path:
            if not os.path.exists(filename):
                continue
        if '*' in path:
            filenames = glob.glob(path)
        else:
            filenames = [path]
        for filename in filenames:
            contents.append(open(filename, 'r').read())
    return ''.join(contents)

def make_app(cfg):
    def app(environ, start_response):
        path = environ['PATH_INFO']

        if path == cfg['compiledFile']:
            compiled = build_compiled_file(cfg)
            start_response('200 OK',
                           [('Content-Type', 'application/javascript'),
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

if __name__ == "__main__":
    cfg = json.loads(open('config.json', 'r').read())
    cfg['compiledFilename'] = cfg['staticFilesDir'] + cfg['compiledFile']

    if len(sys.argv) < 2:
        print __doc__ % cfg
        sys.exit(1)

    cmd = sys.argv[1]
    
    if cmd == 'serve':
        server = make_server('127.0.0.1', cfg['port'], make_app(cfg))
        print "serving on port %d" % cfg['port']
        server.serve_forever()
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
