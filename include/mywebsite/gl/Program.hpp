#pragma once

#include <mywebsite/gl/Shader.hpp>
#include <GLES3/gl3.h>

class Program {
public:
    Program(const Shader& vs, const Shader& fs);
    ~Program();

    void use() const;
    [[nodiscard]] auto valid() const -> bool { return linked_; }

    auto uniform(const char* name) const -> GLint;

    GLuint id() const { return id_; }

private:
    GLuint id_{0};
    bool linked_{false};
};
