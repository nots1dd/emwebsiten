#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Home.hpp>

void HomeScene::render(Renderer& renderer)
{
  auto& assets  = AssetManager::instance();
  auto& shaders = assets.shaders();

  auto& post = (theme_ == Theme::Inverted) ? shaders.program<ShaderID::home_space_inv>()
                                           : shaders.program<ShaderID::home_space>();

  FrameUniforms frame = renderer.make_frame(camera_);

  // iChannel0 = nebula/turbulence detail, iChannel1 = astronaut sprite.
  frame.channels[0] = &assets.textures().get(TextureID::space_nebula);
  frame.channels[1] = &assets.textures().get(TextureID::astronaut);

  renderer.render(post, frame);
}
