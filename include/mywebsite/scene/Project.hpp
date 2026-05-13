#pragma once

#include <mywebsite/scene/Scene.hpp>

// home scene

class ProjectScene : public Scene
{
public:
  explicit ProjectScene(Theme theme) : theme_(theme) {}

  void render(Renderer& renderer) override;

private:
  Theme theme_;
};
