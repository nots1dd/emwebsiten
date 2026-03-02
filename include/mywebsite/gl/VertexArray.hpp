#pragma once

#include <GLES3/gl3.h>

class VertexArray {
public:
    VertexArray();
    ~VertexArray();

    void bind() const;

private:
    GLuint id_;
};
