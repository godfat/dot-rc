
# common setting
export PATH=\
~/bin:\
~/.gem/ruby/1.9.1/bin:\
~/.gem/ruby/1.8/bin:\
/usr/local/bin:\
/usr/local/sbin:\
$PATH

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

export EDITOR=vim
export DISPLAY=localhost:0.0
export TERM=xterm-color

# start fishing...
if test $(which fish 2> /dev/null); then
  fish
fi

source `brew --prefix`/Library/Contributions/brew_bash_completion.sh
source ~/.bashrc

if test -e ~/.rvm/scripts/rvm; then
  source ~/.rvm/scripts/rvm
fi

function bash_where {
  where=$(whoami)@$(hostname)

  if test $where = 'godfat@godfat.local'; then
    echo ''
  else # i don't know why trailing space would make test fail
    echo $where' '
  fi
}

function bash_cwd {
  cwd=$(pwd | ruby -e 'puts $stdin.read.sub(ENV["HOME"], "~").gsub(/(\w).*?\//, "\\1/")')
  if test $(pwd) = $HOME; then
    cwd='~'
  elif test -z $cwd; then
    cwd='/'
  fi

  echo $cwd
}

function bash_git {
  git=$(show_git_branch)

  if test $git; then
    if test $(git config --get fish.hide); then
      # why double quotes?
      echo "$(show_git_dirty)"
    else
      echo ' '$git
    fi
  else
    echo ''
  fi
}

function show_git_dirty {
  # how queer in test we can't use `` to do sub
  if test "$(git status 2> /dev/null | tail -n1)" != 'nothing to commit (working directory clean)' 2> /dev/null; then
    echo '*'
  fi
}

function show_git_branch {
  git symbolic-ref HEAD 2> /dev/null | sed 's/refs\/heads\/\(.*\)/'$(show_git_dirty)'\1/'
}

export PS1='$(bash_where)\[\e[32m\]$(bash_cwd)\[\e[36m\]$(bash_git)\[\e[0m\]$ '
