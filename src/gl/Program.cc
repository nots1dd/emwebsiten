#include "mywebsite/core/ShaderLibrary.hpp"
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

  // bool uniformsValidated = validate_uniforms();

  linked_ = (status == GL_TRUE);

  if (!linked_)
  {
    char log[1024];
    glGetProgramInfoLog(id_, sizeof(log), nullptr, log);
    std::println("Program link error:\n{}", log);
  }
}

auto Program::validate_uniforms() -> bool
{
  GLint count;
  glGetProgramiv(id_, GL_ACTIVE_UNIFORMS, &count);

  std::unordered_map<std::string, GLenum> found;

  char name[256];
  for (int i = 0; i < count; ++i)
  {
    GLsizei len;
    GLint   size;
    GLenum  type;

    glGetActiveUniform(id_, i, sizeof(name), &len, &size, &type, name);

    found[name] = type;
  }

  for (const auto& u : REQUIRED_UNIFORMS)
  {
    auto it = found.find(u.name);

    if (it == found.end())
    {
      std::println("⚠ Missing uniform: {}", u.name);
      return false;
    }
    else if (it->second != u.type)
    {
      std::println("⚠ Type mismatch: {} (expected {}, got {})", u.name, u.type, it->second);
      return false;
    }
  }

  return true;
}

void Program::use() const
{
  if (!linked_)
    return;
  glUseProgram(id_);
}

Program::~Program() { glDeleteProgram(id_); }

auto Program::uniform(const char* name) const -> GLint
{
  auto it = uniform_cache_.find(name);
  if (it != uniform_cache_.end())
    return it->second;

  GLint loc                         = glGetUniformLocation(id_, name);
  uniform_cache_[std::string(name)] = loc;
  return loc;
}
