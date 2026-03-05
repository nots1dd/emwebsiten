#include <mywebsite/core/camera/Camera.hpp>

static auto ortho(float l, float r, float b, float t) -> std::array<float, 16>
{
  return {2.f / (r - l),      0, 0, 0, 0, 2.f / (t - b), 0, 0, 0, 0, -1.f, 0, -(r + l) / (r - l),
          -(t + b) / (t - b), 0, 1};
}

Camera::Camera(float width, float height) { resize(width, height); }

void Camera::resize(float width, float height) { proj_ = ortho(0.f, width, height, 0.f); }

auto Camera::projection() const -> const float* { return proj_.data(); }
