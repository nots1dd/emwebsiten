#pragma once

#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/SceneGraphNode.hpp>

class Engine
{
public:
  void init();
  void frame();
  void set_mouse(float x, float y);
  void accumulate_mouse_delta(float dx, float dy);

  SceneGraph graph_;

  void transition_to_page2();
  void transition_to_home();

  Renderer* renderer_ = nullptr;

private:
  float mouse_dx = 0.0f;
  float mouse_dy = 0.0f;

  float mouse_x = 0.0f;
  float mouse_y = 0.0f;
};
