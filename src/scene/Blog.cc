#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Blog.hpp>

void BlogScene::render(Renderer& renderer)
{
  auto& assets  = AssetManager::instance();
  auto& shaders = assets.shaders();

  auto& post = (theme_ == Theme::Inverted) ? shaders.program<ShaderID::blog_pixel_inv>()
                                           : shaders.program<ShaderID::blog_pixel>();

  FrameUniforms frame = renderer.make_frame(camera_);

  // Palette texture drives the dither color lookup (iChannel0).
  frame.channels[0] = &assets.textures().get(TextureID::pixel_palette);

  renderer.render(post, frame);
}
