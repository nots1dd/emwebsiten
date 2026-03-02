#pragma once

#include <array>

class Camera {
public:
    Camera(float width, float height);

    void resize(float width, float height);

    [[nodiscard]] auto projection() const -> const float*;

private:
    std::array<float, 16> proj_;
};
