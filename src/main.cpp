#include <emscripten/emscripten.h>
#include <mywebsite/core/GLContext.hpp>
#include <mywebsite/core/Renderer.hpp>
#include <mywebsite/gl/Shader.hpp>
#include <mywebsite/core/GLSLLoader.hpp>
#include <print>
#include <string>

static Renderer* renderer = nullptr;

void frame() {
    float t = emscripten_get_now() * 0.001f;
    renderer->render(t, 800.0f, 600.0f);
}

auto main() -> int {
    GLContext ctx("#canvas");
    ctx.make_current();

    std::println("GL_VERSION = {}", reinterpret_cast<const char *>(glGetString(GL_VERSION)));

    glClearColor(0.05f, 0.05f, 0.08f, 1.0f);

    const std::string vs_src =
        GLSLLoader::load("/assets/shaders/fullscreen.vert");
    const std::string fs_src =
        GLSLLoader::load("/assets/shaders/crt.frag");

    if (vs_src.empty() || fs_src.empty()) {
        printf("Failed to load shaders\n");
        return 1;
    }

    Shader vs(GL_VERTEX_SHADER, vs_src);
    Shader fs(GL_FRAGMENT_SHADER, fs_src);

    Program program(vs, fs);
    static Renderer r(program);
    renderer = &r;

    emscripten_set_main_loop(frame, 0, true);
    return 0;
}
