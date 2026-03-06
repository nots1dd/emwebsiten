#pragma once

#include "mywebsite/gl/Program.hpp"
#include "mywebsite/scene/TriangleFullScreen.hpp"
#include <GLES3/gl3.h>
#include <mywebsite/core/FrameUniforms.hpp>

class SceneNode;

class Renderer
{
public:
  Renderer() = default;

  void init(int width, int height);

  void begin_scene();
  void end_scene();

  void render(Program& program, const FrameUniforms& frame);

  auto render_scene_to_texture(SceneNode* node) -> GLuint;

  void render_transition(Program& transition, GLuint texA, GLuint texB, float progress);

private:
  auto create_texture(int w, int h) -> GLuint;

  FullscreenTriangle triangle_;

  GLuint fbo_  = 0;
  GLuint texA_ = 0;
  GLuint texB_ = 0;

  int width_  = 0;
  int height_ = 0;

  GLint uTime_;
  GLint uDelta_;
  GLint uResolution_;
  GLint uMouse_;
  GLint uFrame_;
  GLint uProjection_;
  GLint uView_;
  GLint uCameraPos_;
  GLint uZoom_;
};
