#pragma once

#include <array>

class Camera
{
public:
  Camera(float width, float height);

  void resize(float width, float height);

  void set_position(float x, float y, float z);
  void set_zoom(float zoom);

  [[nodiscard]] auto projection() const -> const float*;
  [[nodiscard]] auto view() const -> const float*;
  [[nodiscard]] auto position() const -> const float*;
  [[nodiscard]] auto zoom() const -> float;
  void               rotate(float dx, float dy);

  void move_forward(float d);
  void move_backward(float d);
  void move_left(float d);
  void move_right(float d);

private:
  void update_view();

  float width_;
  float height_;

  float yaw;
  float pitch;

  float zoom_ = 1.0f;

  std::array<float, 3> position_{0.f, 0.f, 3.5f};

  std::array<float, 16> proj_;
  std::array<float, 16> view_;
};
