#pragma once

#include <array>
#include <cstddef>
#include <string_view>

// ------------------------------------------------------------
// ShaderID
// ------------------------------------------------------------
enum class ShaderID : std::size_t
{
  monochrome,
  plasma,
  ultra,
  nature,
  fade_transition,
  glitch_transition,
  liquid_transition,
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
// Registry (single source of truth)
// ------------------------------------------------------------
constexpr auto shader_registry = std::to_array<ShaderDesc>({
  {.id   = ShaderID::monochrome,
   .name = "monochrome",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/monochrome.frag"},
  {.id   = ShaderID::plasma,
   .name = "plasma",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/plasma.frag"},
  {.id   = ShaderID::ultra,
   .name = "ultra",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/ultra.frag"},
  {.id   = ShaderID::nature,
   .name = "nature",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/nature.frag"},
  {.id   = ShaderID::fade_transition,
   .name = "fade_transition",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/fade.transition.glsl"},
  {.id   = ShaderID::glitch_transition,
   .name = "glitch_transition",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/glitch.transition.glsl"},
  {.id   = ShaderID::liquid_transition,
   .name = "liquid_transition",
   .vert = "/assets/shaders/fullscreen.vert",
   .frag = "/assets/shaders/liquid.transition.glsl"},
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
