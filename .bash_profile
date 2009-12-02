
# common setting
export PATH=\
~/bin:\
~/.gem/ruby/1.9.1/bin/:\
/opt/local/bin:\
/opt/local/sbin:\
/opt/local/lib/postgresql84/bin:\
/opt/local/apache2/bin:\
$PATH

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

export EDITOR=vim
export DISPLAY=localhost:0.0
export TERM=xterm-color

# rubygems in ruby 1.9 has a bug that can't correctly read user gems...
export GEM_HOME=~/.gem/ruby/1.9.1

# mac specific, utf-8 for pbcopy
export __CF_USER_TEXT_ENCODING=0x1F5:0x8000100:0x8000100

# start fishing...
fish

# linux bash specific
alias ls='ls --color'
alias ll='ls -l'
alias la='ll -a'

function bash_prompt {
  git=`show_git_branch`
  where='\033[1;32m'`pwd | sed 's/.*\///g'`'\033[0m'
  if test $git; then
    # bash need echo -e to make color work
    echo -e $where' \033[1;36m'$git'\033[0m$ '
  else
    echo -e `whoami`@`hostname -s` $where'$ '
  fi
}

function show_git_dirty {
  # how queer in test we can't use `` to do sub
  if test "$(git status 2> /dev/null | tail -n1)" != 'nothing to commit (working directory clean)' 2> /dev/null; then
    echo '*'
  fi
}

function show_git_branch {
  git symbolic-ref HEAD 2> /dev/null | sed 's/refs\/heads\/\(.*\)/'`show_git_dirty`'\1/'
}

export PS1='`bash_prompt`'
