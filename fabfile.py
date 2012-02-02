import os

from fabric.api import *
from fabric.contrib.project import rsync_project

ROOT = os.path.abspath(os.path.dirname(__file__))

def lexists(path):
    with settings(warn_only=True):
        return local('test -e %s' % path).succeeded

def _deploy(dirname, url):
    with lcd(ROOT):
        if not lexists('locale'):
            local('git clone https://github.com/hackasaurus/hackasaurus-locales.git locale')
        local('python go.py compilemessages')
        local('python go.py compile')
        rsync_project(remote_dir=dirname,
                      local_dir='static-files/',
                      extra_opts='--copy-links')
    print "Deployed to %s." % url

@task
def experiment(name):
    _deploy(dirname='/var/www/temp/%s' % name,
            url='http://labs.toolness.com/temp/%s/' % name)

@task
def deploy():
    _deploy(dirname='/var/webxray.hackasaurus.org',
            url='http://webxray.hackasaurus.org/')
