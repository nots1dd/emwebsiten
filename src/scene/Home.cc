#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Home.hpp>

void HomeScene::render(Renderer& renderer)
{
  auto& shaders = AssetManager::instance().shaders();

  auto& post = (theme_ == Theme::Inverted) ? shaders.program<ShaderID::home_space_inv>()
                                           : shaders.program<ShaderID::home_space>();

  FrameUniforms frame = renderer.make_frame(camera_);

  renderer.render(post, frame);
}
