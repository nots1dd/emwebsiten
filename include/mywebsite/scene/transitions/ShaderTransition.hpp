#pragma once

#include <algorithm>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Transition.hpp>

class ShaderTransition : public Transition
{
public:
  ShaderTransition(Program& program, float duration) : program_(program), duration_(duration) {}

  void begin() override { time_ = 0.0f; }

  void update(float dt) override { time_ += dt; }

  [[nodiscard]] auto finished() const -> bool override { return time_ >= duration_; }

  void render(Renderer& r, GLuint texA, GLuint texB) override
  {
    float t = std::clamp(time_ / duration_, 0.0f, 1.0f);

    r.render_transition(program_, texA, texB, t);
  }

private:
  Program& program_;

  float time_ = 0;
  float duration_;
};
