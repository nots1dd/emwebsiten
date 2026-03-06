#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Monochrome.hpp>

void MonochromeScene::render(Renderer& renderer)
{
  auto& program = AssetManager::instance().shaders().program<ShaderID::monochrome>();

  FrameUniforms frame{};

  frame.time  = emscripten_get_now() * 0.001f;
  frame.delta = 0.0f;

  frame.width  = 800.0f;
  frame.height = 600.0f;

  frame.mouseX = 0.0f;
  frame.mouseY = 0.0f;

  frame.frame = 0;

  frame.camera = &camera_;

  renderer.render(program, frame);
}
