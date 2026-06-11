#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/About.hpp>

void AboutScene::render(Renderer& renderer)
{
  auto& shaders = AssetManager::instance().shaders();

  auto& post = (theme_ == Theme::Inverted) ? shaders.program<ShaderID::about_forest_inv>()
                                           : shaders.program<ShaderID::about_forest>();

  FrameUniforms frame = renderer.make_frame(camera_);

  renderer.render(post, frame);
}
