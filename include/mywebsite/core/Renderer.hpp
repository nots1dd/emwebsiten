#pragma once

#include <mywebsite/core/FrameUniforms.hpp>
#include <mywebsite/gl/Program.hpp>
#include <mywebsite/scene/TriangleFullScreen.hpp>
#include <array>
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

  // Newest-first ring buffer of recent cursor positions, fed to shaders as
  // uMouseTrail so they can draw a trail that fades with each sample's age.
  static constexpr int TRAIL_N = 16;
  struct TrailSample
  {
    float x = 0.0f, y = 0.0f, t = 0.0f;   // t = 0 marks an unused slot
  };

  void set_mouse(float x, float y)
  {
    mouse_x_ = x;
    mouse_y_ = y;

    // Record a new sample only once the cursor has moved far enough, so the
    // trail spaces out along the path instead of clumping while near-still.
    float dx = x - trail_[0].x, dy = y - trail_[0].y;
    if (trail_[0].t <= 0.0f || dx * dx + dy * dy > 0.0004f)
    {
      for (int i = TRAIL_N - 1; i > 0; --i)
        trail_[i] = trail_[i - 1];
      trail_[0] = TrailSample{x, y, time_ > 0.0f ? time_ : 1e-4f};
    }
  }

  // Per-frame timing pushed once by the engine, read by make_frame().
  void begin_frame(float time, float delta)
  {
    time_  = time;
    delta_ = delta;
  }

  // Build the common per-frame uniforms, syncing the camera to the render size.
  auto make_frame(Camera& cam) -> FrameUniforms;

  [[nodiscard]] auto mouse_x() const -> float { return mouse_x_; }
  [[nodiscard]] auto mouse_y() const -> float { return mouse_y_; }

  auto get_render_width() -> int { return width_; }
  auto get_render_height() -> int { return height_; }

  void render(Program& program, const FrameUniforms& frame);

  auto render_scene_to_texture(SceneNode* node) -> GLuint;

  void render_transition(Program& transition, GLuint texA, GLuint texB, float progress);

  // Register a texture exposed in shaders as iChannelN (bound to unit 2 + index).
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

  std::array<TrailSample, TRAIL_N> trail_{};

  float time_  = 0.0f;
  float delta_ = 0.0f;

  std::vector<GLuint> channels_;
};
