#include <mywebsite/core/AssetManager.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/scene/Ultra.hpp>

void UltraScene::render(Renderer& renderer)
{
  auto& program = AssetManager::instance().shaders().program<ShaderID::ultra>();

  FrameUniforms frame = renderer.make_frame(camera_);

  renderer.render(program, frame);
}
