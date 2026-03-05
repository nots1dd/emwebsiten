#include <mywebsite/core/ShaderLibrary.hpp>
#include <mywebsite/core/ShaderRegistry.hpp>

void load_shaders()
{
  auto& shaders = ShaderLibrary::instance();

  shaders.load_program("crt", "/assets/shaders/fullscreen.vert", "/assets/shaders/crt.frag");

  shaders.load_program("plasma", "/assets/shaders/fullscreen.vert", "/assets/shaders/plasma.frag");

  shaders.load_program("cyberfuji", "/assets/shaders/fullscreen.vert",
                       "/assets/shaders/cyberfuji.frag");
}
