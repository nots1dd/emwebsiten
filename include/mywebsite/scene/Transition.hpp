#pragma once

#include <GLES3/gl3.h>

class Renderer;

class Transition
{
public:
  virtual ~Transition() = default;

  virtual void begin() = 0;

  virtual void update(float dt) = 0;

  virtual void render(Renderer& r, GLuint texA, GLuint texB) = 0;

  [[nodiscard]]
  virtual auto finished() const -> bool = 0;
};
