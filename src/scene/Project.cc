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

  // Molten detail map for the lava shader (iChannel0).
  frame.channels[0] = &assets.textures().get(TextureID::lava);

  renderer.render(post, frame);
}
