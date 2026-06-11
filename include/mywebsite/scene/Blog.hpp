#pragma once

#include <mywebsite/scene/Scene.hpp>

// blog scene — pixel / dithered-gradient background

class BlogScene : public Scene
{
public:
  explicit BlogScene(Theme theme) : theme_(theme) {}

  void render(Renderer& renderer) override;

private:
  Theme theme_;
};
