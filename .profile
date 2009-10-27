
# common setting
export PATH=\
~/bin:\
~/.gem/ruby/1.9.1/bin/:\
/opt/local/bin:\
/opt/local/sbin:\
/opt/local/apache2/bin:\
/usr/local/bin:\
$PATH

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

export EDITOR=vim
export DISPLAY=localhost:0.0

export TERM=xterm-color
alias ls='ls -Gw'
alias ll='ls -lhw'
alias la='ll -a'

# rubygems in ruby 1.9 has a bug that can't correctly read user gems...
export GEM_HOME=~/.gem/ruby/1.9.1

# mac specific, utf-8 for pbcopy
export __CF_USER_TEXT_ENCODING=0x1F5:0x8000100:0x8000100

# start fishing...
fish

# bash specific
function git_aqua_begin {
  echo -e '\033[1;36m'
}

function git_aqua_end   {
  echo -e '\033[0m'
}

function parse_git_dirty {
  [[ $(git status 2> /dev/null | tail -n1) != "nothing to commit (working directory clean)" ]] && echo "*"
}

function parse_git_branch {
  git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e "s/* \(.*\)/ $(git_aqua_begin)\1$(git_aqua_end)$(parse_git_dirty)/"
}

export PS1='\u@\h \[\033[1;32m\]\W\[\033[0m\]$(parse_git_branch)$ '
