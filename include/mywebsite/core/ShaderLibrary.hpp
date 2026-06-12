#pragma once

#include "ShaderRegistry.hpp"
#include <array>
#include <memory>
#include <mywebsite/gl/Program.hpp>

struct UniformSpec
{
  const char* name;
  GLenum      type;
};

static constexpr std::array REQUIRED_UNIFORMS = {
  UniformSpec{"uTime", GL_FLOAT},
  UniformSpec{"uResolution", GL_FLOAT_VEC2}, UniformSpec{"uMouse", GL_FLOAT_VEC2},
  UniformSpec{"uFrame", GL_INT},
  UniformSpec{"uView", GL_FLOAT_MAT4}, UniformSpec{"uCameraPos", GL_FLOAT_VEC3},
  UniformSpec{"uZoom", GL_FLOAT}};

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
  // Compile + link a single shader program from its registry descriptor.
  static auto build(const ShaderDesc& desc) -> std::unique_ptr<Program>;

  std::array<std::unique_ptr<Program>, static_cast<size_t>(ShaderID::COUNT)> programs_;
};
