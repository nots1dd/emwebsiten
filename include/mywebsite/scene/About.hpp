#pragma once

#include <mywebsite/scene/Scene.hpp>

// about scene

class AboutScene : public Scene
{
public:
  explicit AboutScene(Theme theme) : theme_(theme) {}

  void render(Renderer& renderer) override;

private:
  Theme theme_;
};
