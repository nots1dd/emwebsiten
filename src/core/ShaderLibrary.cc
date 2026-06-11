#include <mywebsite/core/GLSLLoader.hpp>
#include <mywebsite/core/ShaderLibrary.hpp>
#include <mywebsite/gl/Shader.hpp>
#include <print>

auto ShaderLibrary::instance() -> ShaderLibrary&
{
  static ShaderLibrary lib;
  return lib;
}

auto ShaderLibrary::build(const ShaderDesc& desc) -> std::unique_ptr<Program>
{
  std::string vs_src = GLSLLoader::load(desc.vert);
  std::string fs_src = GLSLLoader::load(desc.frag);

  Shader vs(GL_VERTEX_SHADER, vs_src);
  Shader fs(GL_FRAGMENT_SHADER, fs_src);

  return std::make_unique<Program>(vs, fs);
}

void ShaderLibrary::load_all()
{
  for (size_t i = 0; i < shader_registry.size(); ++i)
  {
    programs_[i] = build(shader_registry[i]);
    std::println("Loaded shader '{}'", shader_registry[i].name);
  }
}

void ShaderLibrary::reload_all()
{
  std::println("[ShaderLibrary] Reloading all shaders...");

  for (size_t i = 0; i < shader_registry.size(); ++i)
  {
    programs_[i] = build(shader_registry[i]);
    std::println("[ShaderLibrary] Reloaded '{}'", shader_registry[i].name);
  }
}

void ShaderLibrary::reload(ShaderID id)
{
  const auto& desc                   = shader_registry[static_cast<size_t>(id)];
  programs_[static_cast<size_t>(id)] = build(desc);
  std::println("Reloaded shader '{}'", desc.name);
}
