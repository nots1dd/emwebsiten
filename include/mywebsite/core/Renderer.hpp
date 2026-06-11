#pragma once

#include <mywebsite/core/FrameUniforms.hpp>
#include <mywebsite/gl/Program.hpp>
#include <mywebsite/scene/TriangleFullScreen.hpp>
#include <vector>
#include <GLES3/gl3.h>

class SceneNode;

class Renderer
{
public:
  Renderer() = default;

  void init(int width, int height);
  void resize(int width, int height);

  void begin_scene();
  void end_scene();

  void set_mouse(float x, float y)
  {
    mouse_x_ = x;
    mouse_y_ = y;
  }

  // Per-frame timing pushed once by the engine, read by make_frame().
  void begin_frame(float time, float delta)
  {
    time_  = time;
    delta_ = delta;
  }

  // Build the common per-frame uniforms for a scene, syncing the camera to the
  // current render size. Scenes fill in channels/frame index as needed.
  auto make_frame(Camera& cam) -> FrameUniforms;

  [[nodiscard]] auto mouse_x() const -> float { return mouse_x_; }
  [[nodiscard]] auto mouse_y() const -> float { return mouse_y_; }

  auto get_render_width() -> int { return width_; }
  auto get_render_height() -> int { return height_; }

  void render(Program& program, const FrameUniforms& frame);

  auto render_scene_to_texture(SceneNode* node) -> GLuint;

  void render_transition(Program& transition, GLuint texA, GLuint texB, float progress);

  // Register a texture to be available in shaders as iChannelN
  // The channel will be bound to texture unit (2 + index) because
  // units 0 and 1 are used for sceneA/sceneB in transitions.
  void set_channel(int index, GLuint tex);
  [[nodiscard]] auto channel(int index) const -> GLuint;

private:
  auto create_texture(int w, int h) -> GLuint;
  void create_targets(int w, int h);

  FullscreenTriangle triangle_;

  GLuint fbo_  = 0;
  GLuint texA_ = 0;
  GLuint texB_ = 0;

  int width_  = 0;
  int height_ = 0;

  float mouse_x_ = 0.0f;
  float mouse_y_ = 0.0f;

  float time_  = 0.0f;
  float delta_ = 0.0f;

  std::vector<GLuint> channels_;
};
