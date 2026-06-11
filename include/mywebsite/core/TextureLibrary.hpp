#pragma once

#include "TextureRegistry.hpp"
#include <array>
#include <mywebsite/gl/Texture.hpp>

// ------------------------------------------------------------
// TextureLibrary
//
// Loads and owns every texture in the registry, mirroring
// ShaderLibrary. Textures are decoded from the preloaded VFS
// once during AssetManager::initialize().
// ------------------------------------------------------------
class TextureLibrary
{
public:
  static auto instance() -> TextureLibrary&;

  void load_all();
  void reload_all();

  [[nodiscard]] auto get(TextureID id) const -> const Texture&
  {
    return textures_[static_cast<std::size_t>(id)];
  }

  [[nodiscard]] auto handle(TextureID id) const -> GLuint { return get(id).id(); }

private:
  std::array<Texture, static_cast<std::size_t>(TextureID::COUNT)> textures_;
};
