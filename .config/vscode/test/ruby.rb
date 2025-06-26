# frozen_string_literal: true

require 'forwardable'

module Box
  class Cat < Struct.new(:name)
    A = 1
    B = /\A#{A}23\z/i

    extend Forwardable

    def initialize(a = 1, b: nil, c: :symbol)
      super()

      %i[symbol].each do |symbol|
      end

      %w[string].map {
      }

      [Box::Cat::Number].inject(String.new)

      self.class
      self.meow
    end

    def meow
      __method__
      __FILE__
      __LINE__
    end
  end

  def struct_new
    Struct.new(:name)
  end

  class Dog < struct_new
  end
end
