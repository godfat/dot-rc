
export PATH=\
~/bin:\
~/.gem/ruby/1.9.1/bin/:\
/opt/local/bin:\
/opt/local/sbin:\
/opt/local/apache2/bin:\
/usr/local/bin:\
$PATH

# rubygems in ruby 1.9 has a bug that can't correctly read user gems...
export GEM_HOME=~/.gem/ruby/1.9.1

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

export PS1='\u \W \v$ '

export EDITOR=vim
export DISPLAY=localhost:0.0

export TERM=xterm-color
alias ls='ls -Gw'
alias ll='ls -hlw'

# utf-8 for pbcopy
export __CF_USER_TEXT_ENCODING=0x1F5:0x8000100:0x8000100

fish # start fishing...
