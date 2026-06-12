#pragma once

#include <array>
#include <cstddef>
#include <string_view>

// ------------------------------------------------------------
// ShaderID
// ------------------------------------------------------------
enum class ShaderID : std::size_t
{
  home_space,
  home_space_inv,
  about_forest,
  about_forest_inv,
  projects_lava,
  projects_lava_inv,
  crt_static_transition,
  blog_pixel,
  blog_pixel_inv,
  mosaic_dither_transition,
  spacetime_rip_transition,
  overgrowth_transition,
  crystallize_transition,
  COUNT
};

// ------------------------------------------------------------
// Shader Descriptor
// ------------------------------------------------------------
struct ShaderDesc
{
  ShaderID         id;
  std::string_view name;
  std::string_view vert;
  std::string_view frag;
};

// ------------------------------------------------------------
// Registry
// ------------------------------------------------------------
constexpr auto shader_registry = std::to_array<ShaderDesc>({
  {.id   = ShaderID::home_space,
   .name = "home_space",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/home-space.frag"},
  {.id   = ShaderID::home_space_inv,
   .name = "home_space_inv",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/home-space-inv.frag"},
  {.id   = ShaderID::about_forest,
   .name = "about_forest",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/about-forest.frag"},
  {.id   = ShaderID::about_forest_inv,
   .name = "about_forest_inv",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/about-forest-inv.frag"},
  {.id   = ShaderID::projects_lava,
   .name = "projects_lava",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/projects-lava.frag"},
  {.id   = ShaderID::projects_lava_inv,
   .name = "projects_lava_inv",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/projects-lava-inv.frag"},
  {.id   = ShaderID::crt_static_transition,
   .name = "crt_static_transition",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/crt-static.transition.glsl"},
  {.id   = ShaderID::blog_pixel,
   .name = "blog_pixel",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/blog-pixel.frag"},
  {.id   = ShaderID::blog_pixel_inv,
   .name = "blog_pixel_inv",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/blog-pixel-inv.frag"},
  {.id   = ShaderID::mosaic_dither_transition,
   .name = "mosaic_dither_transition",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/mosaic-dither.transition.glsl"},
  {.id   = ShaderID::spacetime_rip_transition,
   .name = "spacetime_rip_transition",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/spacetime-rip.transition.glsl"},
  {.id   = ShaderID::overgrowth_transition,
   .name = "overgrowth_transition",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/overgrowth.transition.glsl"},
  {.id   = ShaderID::crystallize_transition,
   .name = "crystallize_transition",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/crystallize.transition.glsl"},
});

// ------------------------------------------------------------
// Compile-time validation
// ------------------------------------------------------------
constexpr auto validate_shader_registry() -> bool
{
  // size must match enum
  if (shader_registry.size() != static_cast<std::size_t>(ShaderID::COUNT))
    return false;

  // ensure ordering matches enum values
  for (std::size_t i = 0; i < shader_registry.size(); ++i)
  {
    if (static_cast<std::size_t>(shader_registry[i].id) != i)
      return false;
  }

  return true;
}

static_assert(validate_shader_registry(), "Shader registry mismatch with ShaderID");

// ------------------------------------------------------------
// Access helpers
// ------------------------------------------------------------

// ID -> descriptor
constexpr auto get_shader(ShaderID id) -> const ShaderDesc&
{
  return shader_registry[static_cast<std::size_t>(id)];
}

// ID -> name
constexpr auto shader_name(ShaderID id) -> std::string_view { return get_shader(id).name; }

// name -> ID
constexpr auto shader_from_name(std::string_view name) -> ShaderID
{
  for (const auto& s : shader_registry)
  {
    if (s.name == name)
      return s.id;
  }
  return ShaderID::COUNT;
}

// ------------------------------------------------------------
// Utility
// ------------------------------------------------------------

constexpr auto shader_count() -> std::size_t { return static_cast<std::size_t>(ShaderID::COUNT); }
