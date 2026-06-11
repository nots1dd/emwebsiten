#define STB_IMAGE_IMPLEMENTATION
#include <stb_image.h>

#include <mywebsite/gl/Texture.hpp>
#include <print>
#include <utility>

Texture::Texture(std::string_view path) { load(path, Options{}); }

Texture::Texture(std::string_view path, const Options& opts) { load(path, opts); }

Texture::~Texture() { destroy(); }

Texture::Texture(Texture&& other) noexcept
    : id_(other.id_), width_(other.width_), height_(other.height_)
{
  other.id_     = 0;
  other.width_  = 0;
  other.height_ = 0;
}

auto Texture::operator=(Texture&& other) noexcept -> Texture&
{
  if (this != &other)
  {
    destroy();
    id_     = std::exchange(other.id_, 0);
    width_  = std::exchange(other.width_, 0);
    height_ = std::exchange(other.height_, 0);
  }
  return *this;
}

void Texture::destroy()
{
  if (id_ != 0)
  {
    glDeleteTextures(1, &id_);
    id_ = 0;
  }
  width_  = 0;
  height_ = 0;
}

auto Texture::load(std::string_view path) -> bool { return load(path, Options{}); }

auto Texture::load(std::string_view path, const Options& opts) -> bool
{
  stbi_set_flip_vertically_on_load(opts.flip_y ? 1 : 0);

  int            w = 0, h = 0, channels = 0;
  std::string    path_str(path);
  unsigned char* data = stbi_load(path_str.c_str(), &w, &h, &channels, 4); // force RGBA

  if (data == nullptr)
  {
    std::println("[Texture] failed to load '{}': {}", path, stbi_failure_reason());
    return false;
  }

  destroy();

  glGenTextures(1, &id_);
  glBindTexture(GL_TEXTURE_2D, id_);

  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);

  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, opts.wrap_s);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, opts.wrap_t);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, opts.min_filter);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, opts.mag_filter);

  if (opts.mipmaps)
    glGenerateMipmap(GL_TEXTURE_2D);

  glBindTexture(GL_TEXTURE_2D, 0);

  stbi_image_free(data);

  width_  = w;
  height_ = h;

  std::println("[Texture] loaded '{}' ({}x{})", path, w, h);
  return true;
}
