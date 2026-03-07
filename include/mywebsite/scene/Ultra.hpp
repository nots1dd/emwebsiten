#pragma once

#include <mywebsite/scene/Scene.hpp>

class UltraScene : public Scene
{
public:
  void render(Renderer& renderer) override;
};
