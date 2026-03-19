#pragma once

#include <mywebsite/core/FrameUniforms.hpp>
#include <mywebsite/gl/Program.hpp>
#include <mywebsite/scene/TriangleFullScreen.hpp>

class SceneNode;

class Renderer
{
public:
  Renderer() = default;

  void init(int width, int height);

  void begin_scene();
  void end_scene();

  void set_mouse(float x, float y)
  {
    mouse_x_ = x;
    mouse_y_ = y;
  }

  [[nodiscard]] auto mouse_x() const -> float { return mouse_x_; }
  [[nodiscard]] auto mouse_y() const -> float { return mouse_y_; }

  auto get_render_width() -> int { return width_; }
  auto get_render_height() -> int { return height_; }

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

  float mouse_x_ = 0.0f;
  float mouse_y_ = 0.0f;

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
