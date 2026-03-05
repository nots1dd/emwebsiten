#pragma once

#include <memory>
#include <mywebsite/core/Scene.hpp>

class SceneManager
{
public:
  void set(std::unique_ptr<Scene> scene);

  void update(float time);
  void render(Renderer& renderer);

private:
  std::unique_ptr<Scene> current_;
};
