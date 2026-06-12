#pragma once

#include <array>
#include <cstddef>
#include <mywebsite/gl/Texture.hpp>
#include <string_view>

// ------------------------------------------------------------
// TextureID
// ------------------------------------------------------------
enum class TextureID : std::size_t
{
  pixel_palette,
  space_nebula,
  astronaut,
  creeper,
  COUNT
};

// ------------------------------------------------------------
// Texture Descriptor
// ------------------------------------------------------------
struct TextureDesc
{
  TextureID        id;
  std::string_view name;
  std::string_view path; // path in the preloaded virtual filesystem
  Texture::Options options;
};

// ------------------------------------------------------------
// Registry
// ------------------------------------------------------------
constexpr auto texture_registry = std::to_array<TextureDesc>({
  {.id   = TextureID::pixel_palette,
   .name = "pixel_palette",
   .path = "/assets/textures/pixel-palette.png",
   .options = {.wrap_s     = GL_CLAMP_TO_EDGE,
               .wrap_t     = GL_CLAMP_TO_EDGE,
               .min_filter = GL_NEAREST,
               .mag_filter = GL_NEAREST}},
  {.id   = TextureID::space_nebula,
   .name = "space_nebula",
   .path = "/assets/textures/space-nebula.png",
   .options = {.wrap_s     = GL_REPEAT,
               .wrap_t     = GL_REPEAT,
               .min_filter = GL_NEAREST,
               .mag_filter = GL_NEAREST}},
  {.id   = TextureID::astronaut,
   .name = "astronaut",
   .path = "/assets/textures/astronaut.png",
   .options = {.wrap_s     = GL_CLAMP_TO_EDGE,
               .wrap_t     = GL_CLAMP_TO_EDGE,
               .min_filter = GL_NEAREST,
               .mag_filter = GL_NEAREST}},
  {.id   = TextureID::creeper,
   .name = "creeper",
   .path = "/assets/textures/creeper.png",
   .options = {.wrap_s     = GL_CLAMP_TO_EDGE,
               .wrap_t     = GL_CLAMP_TO_EDGE,
               .min_filter = GL_NEAREST,
               .mag_filter = GL_NEAREST}},
});

// ------------------------------------------------------------
// Compile-time validation
// ------------------------------------------------------------
constexpr auto validate_texture_registry() -> bool
{
  if (texture_registry.size() != static_cast<std::size_t>(TextureID::COUNT))
    return false;

  for (std::size_t i = 0; i < texture_registry.size(); ++i)
  {
    if (static_cast<std::size_t>(texture_registry[i].id) != i)
      return false;
  }

  return true;
}

static_assert(validate_texture_registry(), "Texture registry mismatch with TextureID");
