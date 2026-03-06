#pragma once

#include "ShaderRegistry.hpp"
#include <array>
#include <memory>
#include <mywebsite/gl/Program.hpp>

class ShaderLibrary
{
public:
  static auto instance() -> ShaderLibrary&;

  template <ShaderID ID>
  auto program() -> Program&
  {
    return *programs_[static_cast<size_t>(ID)];
  }

  void load_all();
  void reload_all();

  void reload(ShaderID id); // for hot reload

private:
  std::array<std::unique_ptr<Program>, static_cast<size_t>(ShaderID::COUNT)> programs_;
};
