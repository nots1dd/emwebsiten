#include <mywebsite/core/GLSLLoader.hpp>
#include <mywebsite/core/ShaderLibrary.hpp>
#include <mywebsite/gl/Shader.hpp>
#include <print>

auto ShaderLibrary::instance() -> ShaderLibrary&
{
  static ShaderLibrary lib;
  return lib;
}

void ShaderLibrary::load_all()
{
  for (size_t i = 0; i < shader_registry.size(); ++i)
  {
    const auto& desc = shader_registry[i];

    std::string vs_src = GLSLLoader::load(desc.vert);
    std::string fs_src = GLSLLoader::load(desc.frag);

    Shader vs(GL_VERTEX_SHADER, vs_src);
    Shader fs(GL_FRAGMENT_SHADER, fs_src);

    programs_[i] = std::make_unique<Program>(vs, fs);

    std::println("Loaded shader '{}'", desc.name);
  }
}

void ShaderLibrary::reload_all()
{
    std::println("[ShaderLibrary] Reloading all shaders...");

    for (size_t i = 0; i < shader_registry.size(); ++i)
    {
        const auto& desc = shader_registry.at(i);

        std::string vs_src = GLSLLoader::load(desc.vert);
        std::string fs_src = GLSLLoader::load(desc.frag);

        Shader vs(GL_VERTEX_SHADER, vs_src);
        Shader fs(GL_FRAGMENT_SHADER, fs_src);

        programs_[i] = std::make_unique<Program>(vs, fs);

        std::println("[ShaderLibrary] Reloaded '{}'", desc.name);
    }
}

void ShaderLibrary::reload(ShaderID id)
{
  const auto& desc = shader_registry[static_cast<size_t>(id)];

  std::string vs_src = GLSLLoader::load(desc.vert);
  std::string fs_src = GLSLLoader::load(desc.frag);

  Shader vs(GL_VERTEX_SHADER, vs_src);
  Shader fs(GL_FRAGMENT_SHADER, fs_src);

  programs_[static_cast<size_t>(id)] = std::make_unique<Program>(vs, fs);

  std::println("Reloaded shader '{}'", desc.name);
}
