#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/CRT.hpp>

void CRTScene::render(Renderer& renderer)
{
  auto& program = AssetManager::instance().shaders().program("crt");

  FrameUniforms frame{};

  frame.time  = emscripten_get_now() * 0.001f;
  frame.delta = 0.0f;

  frame.width  = 800.0f;
  frame.height = 600.0f;

  frame.mouseX = 0.0f;
  frame.mouseY = 0.0f;

  frame.frame = 0;

  renderer.render(frame);
}
