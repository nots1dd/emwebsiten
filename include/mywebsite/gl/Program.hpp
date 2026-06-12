#pragma once

#include <array>
#include <mywebsite/gl/Shader.hpp>
#include <unordered_map>

class Program
{
public:
  static constexpr int CHANNEL_COUNT = 3;

  // Uniform locations resolved once at link time. -1 means not declared.
  struct Uniforms
  {
    GLint time       = -1;
    GLint delta      = -1;
    GLint resolution = -1;
    GLint mouse      = -1;
    GLint frame      = -1;
    GLint projection = -1;
    GLint view       = -1;
    GLint cameraPos  = -1;
    GLint zoom       = -1;

    std::array<GLint, CHANNEL_COUNT> channel{-1, -1, -1};
    std::array<GLint, CHANNEL_COUNT> channelRes{-1, -1, -1};

    // Transition uniforms
    GLint sceneA        = -1;
    GLint sceneB        = -1;
    GLint progress      = -1;
    GLint transitionRes = -1;
  };

  Program(const Shader& vs, const Shader& fs);
  ~Program();

  void               use() const;
  [[nodiscard]] auto valid() const -> bool { return linked_; }

  auto uniform(const char* name) const -> GLint;

  [[nodiscard]] auto uniforms() const -> const Uniforms& { return uniforms_; }

  [[nodiscard]] auto id() const -> GLuint { return id_; }

private:
  GLuint                                         id_{0};
  bool                                           linked_{false};
  mutable std::unordered_map<std::string, GLint> uniform_cache_;
  Uniforms                                       uniforms_;

  void resolve_uniforms();
  auto validate_uniforms() -> bool;
};
