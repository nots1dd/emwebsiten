#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Project.hpp>

void ProjectScene::render(Renderer& renderer)
{
  auto& assets  = AssetManager::instance();
  auto& shaders = assets.shaders();

  auto& post = (theme_ == Theme::Inverted) ? shaders.program<ShaderID::projects_lava_inv>()
                                           : shaders.program<ShaderID::projects_lava>();

  FrameUniforms frame = renderer.make_frame(camera_);

  // iChannel0 = frost/crystal detail noise for the ice fractal.
  frame.channels[0] = &assets.textures().get(TextureID::space_nebula);

  renderer.render(post, frame);
}
