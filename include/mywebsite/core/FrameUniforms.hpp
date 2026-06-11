#pragma once

#include <mywebsite/core/camera/Camera.hpp>

class Texture;

struct FrameUniforms
{
  // ShaderToy-style texture channels: iChannel0/1/2.
  static constexpr int CHANNEL_COUNT = 3;

  float time  = 0.0f;
  float delta = 0.0f;

  float width  = 0.0f;
  float height = 0.0f;

  float mouseX = 0.0f;
  float mouseY = 0.0f;

  const Camera* camera = nullptr;

  int frame = 0;

  // Per-scene texture channels. nullptr = channel unused.
  const Texture* channels[CHANNEL_COUNT] = {nullptr, nullptr, nullptr};
};
