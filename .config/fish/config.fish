
function fish_prompt -d 'custom prompt'
  set git (show_git_branch)
  set where (whoami)@(hostname)' '

  if test $where = 'godfat@godfat.local '
    set where ''
  end

  if test (prompt_pwd)
    set cwd (prompt_pwd)
  else
    set cwd '/'
  end

  set prompt (echo \x1b'[38;5;102m')(date '+%H:%M')' '(set_color normal)$where(set_color green)$cwd

  if test $git
    if test (git config --get fish.hide)
      echo $prompt(set_color cyan)(show_git_dirty)(set_color normal)'> '
    else
      echo $prompt(set_color cyan) $git(set_color normal)'> '
    end
  else
    echo $prompt(set_color normal)'> '
  end
end

function show_git_dirty -d 'show * if working directory is not clean'
  if test (git status 2> /dev/null | tail -n1) != 'nothing to commit (working directory clean)' 2> /dev/null
    echo '*'
  else
    echo # if you don't echo, sub would produce nothing instead of empty
  end
end

function show_git_branch -d 'show git branch if any'
  git symbolic-ref HEAD 2> /dev/null | sed 's/refs\/heads\/\(.*\)/'(show_git_dirty)'\1/'
end
