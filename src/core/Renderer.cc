#include <GLES3/gl3.h>
#include <mywebsite/core/Renderer.hpp>

Renderer::Renderer(Program& program) : program_(program)
{

  uTime_       = program_.uniform("uTime");
  uDelta_      = program_.uniform("uDelta");
  uResolution_ = program_.uniform("uResolution");
  uMouse_      = program_.uniform("uMouse");
  uFrame_      = program_.uniform("uFrame");
  uProjection_ = program_.uniform("uProjection");
  uView_       = program_.uniform("uView");
  uCameraPos_  = program_.uniform("uCameraPos");
  uZoom_       = program_.uniform("uZoom");
}

void Renderer::render(const FrameUniforms& frame)
{
  glClear(GL_COLOR_BUFFER_BIT);

  program_.use();

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
