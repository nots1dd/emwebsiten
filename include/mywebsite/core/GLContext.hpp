#pragma once

#include <emscripten/html5.h>

class GLContext {
public:
    GLContext(const char* canvas);
    void make_current();
    bool valid() const { return ctx_ != 0; }

private:
    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE ctx_{0};
};
