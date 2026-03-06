#pragma once

#include <emscripten/emscripten.h> // NOLINT
#include <mywebsite/core/camera/Camera.hpp>

class Renderer;

class Scene
{
public:
  Scene() : camera_(800.f, 600.f) {}

  virtual ~Scene() = default;

  virtual void init() {}
  virtual void update([[maybe_unused]] float time) {}
  virtual void render(Renderer& renderer) = 0;

  auto               camera() -> Camera& { return camera_; }
  [[nodiscard]] auto camera() const -> const Camera& { return camera_; }

protected:
  Camera camera_;
};
