#pragma once

#include <mywebsite/core/ShaderLibrary.hpp>
#include <mywebsite/core/TextureLibrary.hpp>

class AssetManager
{
public:
  static auto instance() -> AssetManager&;

  void initialize();

  auto shaders() -> ShaderLibrary&;
  auto textures() -> TextureLibrary&;

private:
  AssetManager();
  ShaderLibrary&  shaders_;
  TextureLibrary& textures_;
};
