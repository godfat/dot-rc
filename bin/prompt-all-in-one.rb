#!/usr/bin/env ruby

module Prompt
  module_function
  def time
    Time.now.strftime('%H:%M')
  end

  def where
    require 'socket'
    require 'etc'
    s = "#{Etc.getlogin}@#{Socket.gethostname} "
    s == 'godfat@godfat.local ' ? '' : s
  end

  def cwd
    Dir.pwd.sub(/^#{ENV['HOME']}/, '~').gsub(/(\w).*?\//, '\1/')
  end

  def dirty
    case `git status --porcelain 2> /dev/null`
      when ''
        ''   # clean
      when /\A(^[AMDR]  [^\n]+\n)+\Z/
        '#' # all staged
      else
        '*' # dirty
    end
  end

  def branch
    return '' if (branch = `git branch 2> /dev/null`).empty?
    branch.match(/\* (.+)/)[1]
  end

  def dirty_branch
    (s = dirty + branch).empty? ? '' : " #{s}"
  end

  def prompt
    msg = `git config --get fish.hide`.empty? ? :dirty_branch : :dirty
    "#{color(102){time}} #{normal{where}}#{green{cwd}}#{cyan{send(msg)}}$ "
  end

  # utility

  def green &block
    color(2, &block)
  end

  def cyan &block
    color(6, &block)
  end

  def normal &block
    color(7, &block)
  end

  def color rgb
    "\033[38;5;#{rgb}m" + (block_given? ? "#{yield}#{normal}" : '')
  end
end

print Prompt.prompt
