#pragma once

#include <GLES3/gl3.h>
#include <string_view>

// Move-only RAII wrapper around a 2D GL texture decoded via stb_image.
class Texture
{
public:
  struct Options
  {
    GLint wrap_s = GL_REPEAT;
    GLint wrap_t = GL_REPEAT;
    GLint min_filter = GL_LINEAR;
    GLint mag_filter = GL_LINEAR;
    bool  mipmaps    = false;
    bool  flip_y     = true; // GL/ShaderToy convention: origin bottom-left
  };

  Texture() = default;
  explicit Texture(std::string_view path);
  Texture(std::string_view path, const Options& opts);
  ~Texture();

  Texture(const Texture&)            = delete;
  Texture& operator=(const Texture&) = delete;

  Texture(Texture&& other) noexcept;
  Texture& operator=(Texture&& other) noexcept;

  // Decode + upload. Returns true on success. Replaces any existing texture.
  auto load(std::string_view path) -> bool;
  auto load(std::string_view path, const Options& opts) -> bool;

  [[nodiscard]] auto id() const -> GLuint { return id_; }
  [[nodiscard]] auto width() const -> int { return width_; }
  [[nodiscard]] auto height() const -> int { return height_; }
  [[nodiscard]] auto valid() const -> bool { return id_ != 0; }

private:
  void destroy();

  GLuint id_     = 0;
  int    width_  = 0;
  int    height_ = 0;
};
