#pragma once

#include <mywebsite/gl/Program.hpp>
#include <mywebsite/scene/TriangleFullScreen.hpp>

class Renderer {
public:
    Renderer(Program& program);
    void render(float time, float w, float h);

private:
    Program& program_;
    FullscreenTriangle triangle_;
    GLint uTime_;
    GLint uResolution_;
};
