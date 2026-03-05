#pragma once

#include <emscripten/emscripten.h>
#include <mywebsite/core/Renderer.hpp>

class Scene
{
public:
  virtual ~Scene() = default;

  virtual void init() {}
  virtual void update([[maybe_unused]] float time) {}
  virtual void render(Renderer& renderer) = 0;
};
