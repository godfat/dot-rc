
function ls -d "color and utf-8 support"
  ls -Gw $argv
end

function ll -d "dunno what's this XD"
  ls -hlw $argv
end

function fish_prompt -d "custom prompt"
  set git (show_git_branch)
  if test $git
    printf '%s%s%s%s%s> ' (set_color $fish_color_cwd) (prompt_pwd) (set_color $fish_color_operator) $git (set_color normal)
  else
    printf '%s %s%s%s> ' (whoami) (set_color $fish_color_cwd) (prompt_pwd) (set_color normal)
  end
end

function show_git_branch -d "show git branch if any"
  set ref (git symbolic-ref HEAD 2> /dev/null)
  test $ref; or return
  echo " @$ref" | sed s/refs\\/heads\\///g
end
