#pragma once

#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/core/SceneManager.hpp>

class Engine
{
public:
  void init();
  void frame();

private:
  Renderer*    renderer_ = nullptr;
  SceneManager scenes_;
};
