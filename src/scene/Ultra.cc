#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Ultra.hpp>

void UltraScene::render(Renderer& renderer)
{
  auto& program = AssetManager::instance().shaders().program<ShaderID::ultra>();

  FrameUniforms frame{};

  frame.time  = emscripten_get_now() * 0.001f;
  frame.delta = 0.0f;

  frame.width  = renderer.get_render_width();
  frame.height = renderer.get_render_height();

  frame.mouseX = 0.0f;
  frame.mouseY = 0.0f;

  frame.frame = 0;

  frame.camera = &camera_;

  renderer.render(program, frame);
}
