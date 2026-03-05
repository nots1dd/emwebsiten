#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/ShaderRegistry.hpp>

auto AssetManager::instance() -> AssetManager&
{
  static AssetManager manager;
  return manager;
}

AssetManager::AssetManager() : shaders_(ShaderLibrary::instance()) {}

void AssetManager::initialize() { load_shaders(); }

auto AssetManager::shaders() -> ShaderLibrary& { return shaders_; }
