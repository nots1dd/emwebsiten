#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Page2.hpp>

void Page2Scene::render(Renderer& renderer)
{
  auto& post = AssetManager::instance().shaders().program<ShaderID::plasma>();

  FrameUniforms frame{};

  frame.time   = emscripten_get_now() * 0.001f;
  frame.width  = renderer.get_render_width();
  frame.height = renderer.get_render_height();
  frame.mouseX = renderer.mouse_x();
  frame.mouseY = renderer.mouse_y();

  frame.frame = 0;

  frame.camera = &camera_;

  renderer.render(post, frame);
}
