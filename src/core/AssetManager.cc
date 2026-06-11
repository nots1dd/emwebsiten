#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/ShaderRegistry.hpp>

auto AssetManager::instance() -> AssetManager&
{
  static AssetManager manager;
  return manager;
}

AssetManager::AssetManager()
    : shaders_(ShaderLibrary::instance()), textures_(TextureLibrary::instance())
{
}

void AssetManager::initialize()
{
  shaders_.load_all();
  textures_.load_all();
}

auto AssetManager::shaders() -> ShaderLibrary& { return shaders_; }

auto AssetManager::textures() -> TextureLibrary& { return textures_; }
