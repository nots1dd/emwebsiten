#pragma once

#include <mywebsite/gl/Shader.hpp>

class Program
{
public:
  Program(const Shader& vs, const Shader& fs);
  ~Program();

  void               use() const;
  [[nodiscard]] auto valid() const -> bool { return linked_; }

  auto uniform(const char* name) const -> GLint;

  [[nodiscard]] auto id() const -> GLuint { return id_; }

private:
  GLuint id_{0};
  bool   linked_{false};
};
