"""
    usage: go.py <command>
    
    commands:
    
      serve   - run web server on port %(port)s
      compile - generate %(compiledFilename)s
"""

from wsgiref.simple_server import make_server
from wsgiref.util import FileWrapper
import os
import sys
import shutil
import mimetypes

try:
    import json
except ImportError:
    import simplejson as json

def build_compiled_file(cfg):
    for filename in cfg['compiledFileParts']:
        yield open(filename, 'r').read()

def make_app(cfg):
    def app(environ, start_response):
        path = environ['PATH_INFO']

        if path == cfg['compiledFile']:
            start_response('200 OK', [('Content-Type',
                                       'application/javascript')])
            return build_compiled_file(cfg)

        if path.endswith('/'):
            path = '%sindex.html' % path
        static_files_dir = os.path.abspath(cfg['staticFilesDir'])
        fileparts = path[1:].split('/')
        fullpath = os.path.join(static_files_dir, *fileparts)
        fullpath = os.path.normpath(fullpath)
        (mimetype, encoding) = mimetypes.guess_type(fullpath)
        if (fullpath.startswith(static_files_dir) and
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
        server = make_server('', cfg['port'], make_app(cfg))
        print "serving on port %d" % cfg['port']
        server.serve_forever()
    elif cmd == 'compile':
        f = open(cfg['compiledFilename'], 'w')
        for chunk in build_compiled_file(cfg):
            f.write(chunk)
        f.close()
        print "wrote %s" % cfg['compiledFilename']
    else:
        print "unknown command: %s" % cmd
        sys.exit(1)
