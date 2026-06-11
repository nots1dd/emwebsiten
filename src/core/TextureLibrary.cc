#include <mywebsite/core/TextureLibrary.hpp>
#include <print>

auto TextureLibrary::instance() -> TextureLibrary&
{
  static TextureLibrary lib;
  return lib;
}

void TextureLibrary::load_all()
{
  for (std::size_t i = 0; i < texture_registry.size(); ++i)
  {
    const auto& desc = texture_registry[i];

    if (textures_[i].load(desc.path, desc.options))
      std::println("Loaded texture '{}'", desc.name);
    else
      std::println("[TextureLibrary] failed to load '{}' ({})", desc.name, desc.path);
  }
}

void TextureLibrary::reload_all()
{
  std::println("[TextureLibrary] Reloading all textures...");
  load_all();
}
