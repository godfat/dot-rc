
function ls -d "color and utf-8 support"
  ls -Gw $argv
end

function ll -d "short for ls -lh"
  ls -lh $argv
end

function la -d "short for ll -a"
  ll -a $argv
end

function fish_prompt -d "custom prompt"
  set git (show_git_branch)
  if test $git
    printf '%s%s%s%s%s> ' (set_color $fish_color_cwd) (prompt_pwd) (set_color cyan) $git (set_color normal)
  else
    printf '%s %s%s%s> ' (whoami) (set_color $fish_color_cwd) (prompt_pwd) (set_color normal)
  end
end

function show_git_dirty -d "show * if working directory is not clean"
  if test (git status 2> /dev/null | tail -n1) != 'nothing to commit (working directory clean)' 2> /dev/null
    echo ' *'
  end
end

function show_git_branch -d "show git branch if any"
  git symbolic-ref HEAD 2> /dev/null | sed -e 's/refs\/heads\/\(.*\)/'(show_git_dirty)'\1/'
end
