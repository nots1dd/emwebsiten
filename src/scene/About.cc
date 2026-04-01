#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/About.hpp>

void AboutScene::render(Renderer& renderer)
{
  auto& shaders = AssetManager::instance().shaders();

  auto& post = (theme_ == Theme::Inverted)
                 ? shaders.program<ShaderID::not_neon_inv>()
                 : shaders.program<ShaderID::not_neon>();

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
