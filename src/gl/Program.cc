#include <mywebsite/gl/Program.hpp>
#include <print>

Program::Program(const Shader& vs, const Shader& fs)
{
  id_ = glCreateProgram();
  glAttachShader(id_, vs.id());
  glAttachShader(id_, fs.id());
  glLinkProgram(id_);

  GLint status = 0;
  glGetProgramiv(id_, GL_LINK_STATUS, &status);
  linked_ = (status == GL_TRUE);

  if (!linked_)
  {
    char log[1024];
    glGetProgramInfoLog(id_, sizeof(log), nullptr, log);
    std::println("Program link error:\n{}", log);
  }
}

void Program::use() const
{
  if (!linked_)
    return;
  glUseProgram(id_);
}

Program::~Program() { glDeleteProgram(id_); }

auto Program::uniform(const char* name) const -> GLint { return glGetUniformLocation(id_, name); }
