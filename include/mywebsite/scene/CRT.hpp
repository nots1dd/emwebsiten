#pragma once

#include <mywebsite/core/Scene.hpp>

class CRTScene : public Scene
{
public:
  void render(Renderer& renderer) override;
};
