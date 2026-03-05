#include <GLES3/gl3.h>
#include <mywebsite/core/Renderer.hpp>

Renderer::Renderer(Program& program) : program_(program)
{

  uTime_       = program_.uniform("uTime");
  uDelta_      = program_.uniform("uDelta");
  uResolution_ = program_.uniform("uResolution");
  uMouse_      = program_.uniform("uMouse");
  uFrame_      = program_.uniform("uFrame");
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

  triangle_.draw();
}
