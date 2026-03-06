#include <GLES3/gl3.h>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/SceneGraphNode.hpp>

void Renderer::init(int width, int height)
{
  width_  = width;
  height_ = height;

  glGenFramebuffers(1, &fbo_);

  texA_ = create_texture(width, height);
  texB_ = create_texture(width, height);
}

auto Renderer::create_texture(int w, int h) -> GLuint
{
  GLuint tex;

  glGenTextures(1, &tex);
  glBindTexture(GL_TEXTURE_2D, tex);

  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);

  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

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

void Renderer::render(Program& program, const FrameUniforms& frame)
{
  glBindFramebuffer(GL_FRAMEBUFFER, 0);

  glViewport(0, 0, width_, height_);

  glClear(GL_COLOR_BUFFER_BIT);

  program.use();

  uTime_       = program.uniform("uTime");
  uDelta_      = program.uniform("uDelta");
  uResolution_ = program.uniform("uResolution");
  uMouse_      = program.uniform("uMouse");
  uFrame_      = program.uniform("uFrame");
  uProjection_ = program.uniform("uProjection");
  uView_       = program.uniform("uView");
  uCameraPos_  = program.uniform("uCameraPos");
  uZoom_       = program.uniform("uZoom");

  if (uTime_ >= 0)
    glUniform1f(uTime_, frame.time);

  if (uDelta_ >= 0)
    glUniform1f(uDelta_, frame.delta);

  if (uResolution_ >= 0)
    glUniform2f(uResolution_, frame.width, frame.height);

  if (uMouse_ >= 0)
    glUniform2f(uMouse_, frame.mouseX, frame.mouseY);

  if (uFrame_ >= 0)
    glUniform1i(uFrame_, frame.frame);

  if (frame.camera)
  {
    if (uProjection_ >= 0)
      glUniformMatrix4fv(uProjection_, 1, false, frame.camera->projection());

    if (uView_ >= 0)
      glUniformMatrix4fv(uView_, 1, false, frame.camera->view());

    if (uCameraPos_ >= 0)
      glUniform3fv(uCameraPos_, 1, frame.camera->position());

    if (uZoom_ >= 0)
      glUniform1f(uZoom_, frame.camera->zoom());
  }

  triangle_.draw();
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

void Renderer::render_transition(
    Program& program,
    GLuint texA,
    GLuint texB,
    float progress)
{
    glBindFramebuffer(GL_FRAMEBUFFER,0);

    glViewport(0,0,width_,height_);
    glClear(GL_COLOR_BUFFER_BIT);

    program.use();

    GLint locA = program.uniform("sceneA");
    GLint locB = program.uniform("sceneB");
    GLint locT = program.uniform("progress");
    GLint locRes = program.uniform("resolution");

    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texA);
    glUniform1i(locA,0);

    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, texB);
    glUniform1i(locB,1);

    glUniform1f(locT,progress);

    if(locRes >= 0)
        glUniform2f(locRes,width_,height_);

    triangle_.draw();
}
