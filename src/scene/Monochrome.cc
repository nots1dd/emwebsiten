#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Monochrome.hpp>
#include <print>

void MonochromeScene::render(Renderer& renderer)
{
  auto& program = AssetManager::instance().shaders().program<ShaderID::monochrome>();

  FrameUniforms frame{};

  frame.time  = emscripten_get_now() * 0.001f;
  frame.delta = 0.0f;

  frame.width  = renderer.get_render_width();
  frame.height = renderer.get_render_height();

  frame.mouseX = renderer.mouse_x();
  frame.mouseY = renderer.get_render_height() - renderer.mouse_y();
  ;

  std::println("MouseX: {}, MouseY: {}", frame.mouseX, frame.mouseY);

  frame.frame = 0;

  frame.camera = &camera_;

  renderer.render(program, frame);
}
