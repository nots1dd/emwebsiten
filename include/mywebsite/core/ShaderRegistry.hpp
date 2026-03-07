#pragma once

#include <array>
#include <string_view>

struct ShaderDesc
{
  std::string_view name;
  std::string_view vert;
  std::string_view frag;
};

enum class ShaderID : size_t
{
  crt,
  plasma,
  monochrome,

  fade_transition,
  glitch_transition,

  COUNT
};

constexpr auto shader_registry = std::to_array<ShaderDesc>(
  {{.name = "crt", .vert = "/assets/shaders/fullscreen.vert", .frag = "/assets/shaders/crt.frag"},
   {.name = "plasma",
    .vert = "/assets/shaders/fullscreen.vert",
    .frag = "/assets/shaders/plasma.frag"},
   {.name = "monochrome",
    .vert = "/assets/shaders/fullscreen.vert",
    .frag = "/assets/shaders/monochrome.frag"},
   {.name = "fade_transition",
    .vert = "/assets/shaders/fullscreen.vert",
    .frag = "/assets/shaders/fade.transition.glsl"},
   {.name = "glitch_transition",
    .vert = "/assets/shaders/fullscreen.vert",
    .frag = "/assets/shaders/glitch.transition.glsl"}});
