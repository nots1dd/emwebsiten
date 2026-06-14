#include <GLES3/gl3.h>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/gl/Texture.hpp>
#include <mywebsite/scene/SceneGraphNode.hpp>
#include <print>

void Renderer::init(int width, int height)
{
  glGenFramebuffers(1, &fbo_);

  create_targets(width, height);

  glDisable(GL_DEPTH_TEST);
  glDisable(GL_CULL_FACE);
}

void Renderer::resize(int width, int height)
{
  if (width <= 0 || height <= 0 || (width == width_ && height == height_))
    return;

  create_targets(width, height);
}

void Renderer::create_targets(int width, int height)
{
  width_  = width;
  height_ = height;

  // Recreate the ping-pong render targets used by scene transitions.
  if (texA_ != 0)
    glDeleteTextures(1, &texA_);
  if (texB_ != 0)
    glDeleteTextures(1, &texB_);

  texA_ = create_texture(width, height);
  texB_ = create_texture(width, height);

  glBindFramebuffer(GL_FRAMEBUFFER, fbo_);
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texA_, 0);

  if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
    std::println("[Renderer] FBO incomplete!");

  glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

auto Renderer::create_texture(int w, int h) -> GLuint
{
  GLuint tex;

  glGenTextures(1, &tex);
  glBindTexture(GL_TEXTURE_2D, tex);

  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);

  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

  return tex;
}

void Renderer::begin_scene()
{
  glBindFramebuffer(GL_FRAMEBUFFER, 0);
  glViewport(0, 0, width_, height_);
  glClear(GL_COLOR_BUFFER_BIT);
}

void Renderer::end_scene()
{
  // nothing needed for now
}

auto Renderer::make_frame(Camera& cam) -> FrameUniforms
{
  // Keep the camera matched to the live render target.
  cam.resize(static_cast<float>(width_), static_cast<float>(height_));

  FrameUniforms frame{};
  frame.time   = time_;
  frame.delta  = delta_;
  frame.width  = static_cast<float>(width_);
  frame.height = static_cast<float>(height_);
  frame.mouseX = mouse_x_;
  frame.mouseY = mouse_y_;
  frame.camera = &cam;
  return frame;
}

void Renderer::render(Program& program, const FrameUniforms& frame)
{
  glViewport(0, 0, width_, height_);

  glClear(GL_COLOR_BUFFER_BIT);

  program.use();

  const Program::Uniforms& u = program.uniforms();

  if (u.time >= 0)
    glUniform1f(u.time, frame.time);

  if (u.delta >= 0)
    glUniform1f(u.delta, frame.delta);

  if (u.resolution >= 0)
    glUniform2f(u.resolution, frame.width, frame.height);

  if (u.mouse >= 0)
    glUniform2f(u.mouse, frame.mouseX, frame.mouseY);

  // Cursor trail: pack newest-first positions + age (seconds) for uMouseTrail.
  if (u.mouseTrail >= 0)
  {
    std::array<float, TRAIL_N * 3> packed{};
    for (int i = 0; i < TRAIL_N; ++i)
    {
      packed[i * 3 + 0] = trail_[i].x;
      packed[i * 3 + 1] = trail_[i].y;
      packed[i * 3 + 2] = (trail_[i].t <= 0.0f) ? 1.0e3f : (frame.time - trail_[i].t);
    }
    glUniform3fv(u.mouseTrail, TRAIL_N, packed.data());
  }

  if (u.frame >= 0)
    glUniform1i(u.frame, frame.frame);

  if (frame.camera)
  {
    if (u.projection >= 0)
      glUniformMatrix4fv(u.projection, 1, false, frame.camera->projection());

    if (u.view >= 0)
      glUniformMatrix4fv(u.view, 1, false, frame.camera->view());

    if (u.cameraPos >= 0)
      glUniform3fv(u.cameraPos, 1, frame.camera->position());

    if (u.zoom >= 0)
      glUniform1f(u.zoom, frame.camera->zoom());
  }

  // ShaderToy-style channels: bind each to its own unit as iChannelN + iChannelResolution[N].
  for (int i = 0; i < FrameUniforms::CHANNEL_COUNT; ++i)
  {
    const Texture* channel = frame.channels[i];
    if (channel == nullptr || channel->id() == 0)
      continue;

    glActiveTexture(GL_TEXTURE0 + static_cast<GLenum>(i));
    glBindTexture(GL_TEXTURE_2D, channel->id());

    if (u.channel[i] >= 0)
      glUniform1i(u.channel[i], i);

    if (u.channelRes[i] >= 0)
      glUniform3f(u.channelRes[i], static_cast<float>(channel->width()),
                  static_cast<float>(channel->height()), 1.0f);
  }

  glActiveTexture(GL_TEXTURE0);

  triangle_.draw();
}

void Renderer::set_channel(int index, GLuint tex)
{
  if (index < 0)
    return;

  if ((size_t)index >= channels_.size())
    channels_.resize(index + 1, 0);

  channels_[index] = tex;
}

auto Renderer::channel(int index) const -> GLuint
{
  if (index < 0 || (size_t)index >= channels_.size())
    return 0;
  return channels_[index];
}

auto Renderer::render_scene_to_texture(SceneNode* node) -> GLuint
{
  static bool toggle = false;

  GLuint tex = toggle ? texA_ : texB_;
  toggle     = !toggle;

  glBindFramebuffer(GL_FRAMEBUFFER, fbo_);

  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, tex, 0);

  glViewport(0, 0, width_, height_);

  glClear(GL_COLOR_BUFFER_BIT);

  node->render(*this);

  glBindFramebuffer(GL_FRAMEBUFFER, 0);

  return tex;
}

void Renderer::render_transition(Program& program, GLuint texA, GLuint texB, float progress)
{
  glBindFramebuffer(GL_FRAMEBUFFER, 0);

  glViewport(0, 0, width_, height_);
  glClear(GL_COLOR_BUFFER_BIT);

  program.use();

  const Program::Uniforms& u = program.uniforms();

  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, texA);
  if (u.sceneA >= 0)
    glUniform1i(u.sceneA, 0);

  glActiveTexture(GL_TEXTURE1);
  glBindTexture(GL_TEXTURE_2D, texB);
  if (u.sceneB >= 0)
    glUniform1i(u.sceneB, 1);

  if (u.progress >= 0)
    glUniform1f(u.progress, progress);

  if (u.transitionRes >= 0)
    glUniform2f(u.transitionRes, width_, height_);

  // User channels start at unit 2 to avoid colliding with sceneA/sceneB (units 0/1).
  for (int i = 0; i < Program::CHANNEL_COUNT; ++i)
  {
    GLuint tex = channel(i);
    if (tex == 0 || u.channel[i] < 0)
      continue;

    glActiveTexture(GL_TEXTURE0 + static_cast<GLenum>(2 + i));
    glBindTexture(GL_TEXTURE_2D, tex);
    glUniform1i(u.channel[i], 2 + i);
  }

  glActiveTexture(GL_TEXTURE0);

  triangle_.draw();
}
