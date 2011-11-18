from fabric.api import *

PROJ_ROOT = '~/webxray'

@task
def deploy():
    with cd(PROJ_ROOT):
        run('git pull')
        run('python go.py compile')
