#pragma once

#include <GLES3/gl3.h>
#include <string>

class Shader {
public:
    Shader(GLenum type, const std::string& source);
    ~Shader();

    [[nodiscard]] auto id() const -> GLuint { return id_; }
    [[nodiscard]] auto valid() const -> bool { return valid_; }

private:
    GLuint id_;
    bool valid_{false};
};
