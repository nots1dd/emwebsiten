#include <mywebsite/core/GLSLLoader.hpp>
#include <mywebsite/core/ShaderLibrary.hpp>
#include <mywebsite/gl/Shader.hpp>
#include <print>

auto ShaderLibrary::instance() -> ShaderLibrary&
{
  static ShaderLibrary lib;
  return lib;
}

void ShaderLibrary::load_program(const std::string& name, const std::string& vs_path,
                                 const std::string& fs_path)
{
  std::string vs_src = GLSLLoader::load(vs_path);
  std::string fs_src = GLSLLoader::load(fs_path);

  Shader vs(GL_VERTEX_SHADER, vs_src);
  Shader fs(GL_FRAGMENT_SHADER, fs_src);

  auto program = std::make_unique<Program>(vs, fs);

  programs_[name] = std::move(program);

  std::println("Loaded shader program '{}'", name);
}

auto ShaderLibrary::program(const std::string& name) -> Program& { return *programs_.at(name); }
