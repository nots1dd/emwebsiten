#include <mywebsite/core/Renderer.hpp>
#include <GLES3/gl3.h>

Renderer::Renderer(Program& program)
    : program_(program) {

    uTime_ = program_.uniform("uTime");
    uResolution_ = program_.uniform("uResolution");
}

void Renderer::render(float time, float w, float h) {
    glClear(GL_COLOR_BUFFER_BIT);

    program_.use();
    glUniform1f(uTime_, time);
    glUniform2f(uResolution_, w, h);

    triangle_.draw();
}
