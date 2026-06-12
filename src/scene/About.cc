#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/About.hpp>

void AboutScene::render(Renderer& renderer)
{
  auto& assets  = AssetManager::instance();
  auto& shaders = assets.shaders();

  auto& post = (theme_ == Theme::Inverted) ? shaders.program<ShaderID::about_forest_inv>()
                                           : shaders.program<ShaderID::about_forest>();

  FrameUniforms frame = renderer.make_frame(camera_);

  // iChannel0 = foliage/ground/water detail, iChannel1 = creeper sprite.
  frame.channels[0] = &assets.textures().get(TextureID::space_nebula);
  frame.channels[1] = &assets.textures().get(TextureID::creeper);

  renderer.render(post, frame);
}
