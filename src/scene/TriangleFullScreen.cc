#include <mywebsite/scene/TriangleFullScreen.hpp>
#include <GLES3/gl3.h>

FullscreenTriangle::FullscreenTriangle() {
    vao_.bind(); // No VBO needed (gl_VertexID trick)
}

void FullscreenTriangle::draw() const {
    vao_.bind();
    glDrawArrays(GL_TRIANGLES, 0, 3);
}
