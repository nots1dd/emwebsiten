#include <mywebsite/gl/Shader.hpp>
#include <print>

Shader::Shader(GLenum type, const std::string& source)
{
  id_ = glCreateShader(type);

  const char* src = source.c_str();
  glShaderSource(id_, 1, &src, nullptr);
  glCompileShader(id_);

  GLint ok = 0;
  glGetShaderiv(id_, GL_COMPILE_STATUS, &ok);
  valid_ = ok == GL_TRUE;

  if (!valid_)
  {
    char log[1024];
    glGetShaderInfoLog(id_, sizeof(log), nullptr, log);
    std::println("Shader compile error:\n{}", log);
    std::println("===== SOURCE BEGIN =====\n{}\n===== SOURCE END =====", src);
  }
}

Shader::~Shader()
{
  if (id_)
    glDeleteShader(id_);
}
