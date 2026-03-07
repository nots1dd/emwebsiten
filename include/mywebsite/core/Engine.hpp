#pragma once

#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/SceneGraphNode.hpp>

class Engine
{
public:
  void init();
  void frame();
  void set_input_enabled(bool v);
  void mouse_move(float dx, float dy);

  bool       input_enabled = false;
  SceneGraph graph_;

  void transition_to_glow();
  void transition_to_monochrome();

private:
  Renderer* renderer_ = nullptr;

  float mouse_dx = 0.0f;
  float mouse_dy = 0.0f;
};
