#pragma once

#include <mywebsite/core/FrameUniforms.hpp>
#include <mywebsite/gl/Program.hpp>
#include <mywebsite/scene/TriangleFullScreen.hpp>

class Renderer
{
public:
  Renderer(Program& program);

  void render(const FrameUniforms& frame);

private:
  Program&           program_;
  FullscreenTriangle triangle_;

  GLint uTime_;
  GLint uDelta_;
  GLint uResolution_;
  GLint uMouse_;
  GLint uFrame_;
};
