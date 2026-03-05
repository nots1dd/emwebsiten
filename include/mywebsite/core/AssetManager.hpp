#pragma once

#include <mywebsite/core/ShaderLibrary.hpp>

class AssetManager
{
public:
  static auto instance() -> AssetManager&;

  void initialize();

  auto shaders() -> ShaderLibrary&;

private:
  AssetManager();
  ShaderLibrary& shaders_;
};
