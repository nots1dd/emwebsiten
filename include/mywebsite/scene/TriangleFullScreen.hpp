#pragma once

#include <mywebsite/gl/VertexArray.hpp>

class FullscreenTriangle {
public:
    FullscreenTriangle();
    void draw() const;

private:
    VertexArray vao_;
};
