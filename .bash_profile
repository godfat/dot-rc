
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
if   test `uname` = 'Linux'; then
  alias ls='ls --color'
  alias ll='ls -l'
  alias la='ll -a'
# mac bash specific
elif test `uname` = 'Darwin'; then
  alias ls='ls -Gw'
  alias ll='ls -lhw'
  alias la='ll -a'
fi

function bash_prompt {
  git=`show_git_branch`
  # where='\033[1;32m'`pwd | sed 's/.*\///g'`'\033[0m'@`whoami`' '
  where=`whoami`@`hostname`

  if test $where = 'godfat@godfat'; then
    where=''
  else
    where=$where' '
  fi

  cwd=`pwd | ruby -e 'puts $stdin.read.sub(ENV["HOME"], "~").gsub(/(\w).*?\//, "\\\\1/")'`
  if test `pwd` = $HOME; then
    cwd='~'
  elif test -z $cwd; then
    cwd='/'
  fi
  prompt=$where'\033[1;32m'$cwd

  if test $git; then
    if test `git config --get fish.hide`; then
      # bash need echo -e to make color work
      echo -e $prompt'\033[1;36m'`show_git_dirty`'\033[0m$ '
    else
      echo -e $prompt'\033[1;36m' $git'\033[0m$ '
    fi
  else
    echo -e $prompt'\033[0m$ '
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
