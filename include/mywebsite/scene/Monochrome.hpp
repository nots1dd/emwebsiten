#pragma once

#include <mywebsite/scene/Scene.hpp>

class MonochromeScene : public Scene
{
public:
  void render(Renderer& renderer) override;
};
