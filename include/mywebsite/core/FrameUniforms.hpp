#pragma once

#include <mywebsite/core/camera/Camera.hpp>

struct FrameUniforms
{
  float time  = 0.0f;
  float delta = 0.0f;

  float width  = 0.0f;
  float height = 0.0f;

  float mouseX = 0.0f;
  float mouseY = 0.0f;

  const Camera* camera = nullptr;

  int frame = 0;
};
