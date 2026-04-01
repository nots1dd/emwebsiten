#pragma once

#include <mywebsite/scene/Scene.hpp>

// home scene

class HomeScene : public Scene
{
public:
  explicit HomeScene(Theme theme) : theme_(theme) {}

  void render(Renderer& renderer) override;

private:
  Theme theme_;
};
