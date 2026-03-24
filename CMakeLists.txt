cmake_minimum_required(VERSION 3.5...4.2.1)
project(emwebsiten LANGUAGES C CXX)

# general project cmake includes
include(cmake/Assets.cmake)

# -----------------------------------------------------------
# Emscripten toolchain detection (STRICT)
# -----------------------------------------------------------

# Try to locate tools
find_program(EMWEBSITEN_EMCMAKE emcmake)
find_program(EMWEBSITEN_EMCC emcc)
find_program(EMWEBSITEN_EMXX em++)

# Debug print
message(STATUS "---- Emscripten Toolchain Detection ----")
message(STATUS "emcmake : ${EMWEBSITEN_EMCMAKE}")
message(STATUS "emcc    : ${EMWEBSITEN_EMCC}")
message(STATUS "em++    : ${EMWEBSITEN_EMXX}")

# Fail if not found
if(NOT EMWEBSITEN_EMCMAKE OR NOT EMWEBSITEN_EMCC OR NOT EMWEBSITEN_EMXX)
    message(FATAL_ERROR
        "\n❌ Emscripten toolchain not found!\n"
        "Make sure you ran:\n"
        "  source emsdk_env.sh\n"
    )
endif()

# -----------------------------------------------------------
# Detect EMSDK root (from emcc path)
# -----------------------------------------------------------

get_filename_component(EMWEBSITEN_EMCC_DIR ${EMWEBSITEN_EMCC} DIRECTORY)
get_filename_component(EMWEBSITEN_EMSDK_ROOT ${EMWEBSITEN_EMCC_DIR}/../.. ABSOLUTE)

message(STATUS "Detected EMSDK root: ${EMWEBSITEN_EMSDK_ROOT}")

# -----------------------------------------------------------
# Reject system emscripten (/usr/lib)
# -----------------------------------------------------------

if(EMWEBSITEN_EMCC MATCHES "^/usr/")
    message(FATAL_ERROR
        "\n❌ System Emscripten detected!\n"
        "Path: ${EMWEBSITEN_EMCC}\n\n"
        "This project requires EMSDK version.\n"
        "Fix:\n"
        "  source /path/to/emsdk/emsdk_env.sh\n"
        "  rm -rf build\n"
    )
endif()

# -----------------------------------------------------------
# Ensure CMake is actually using em++
# -----------------------------------------------------------

if(NOT CMAKE_CXX_COMPILER MATCHES "em\\+\\+")
    message(FATAL_ERROR
        "\n❌ CMake is NOT using em++!\n"
        "Current compiler: ${CMAKE_CXX_COMPILER}\n\n"
        "Fix:\n"
        "  emcmake cmake ...\n"
        "or\n"
        "  -DCMAKE_CXX_COMPILER=em++\n"
    )
endif()

message(STATUS "✔ Emscripten toolchain validated")

# -----------------------------------------------------------
# ccache detect
# -----------------------------------------------------------
find_program(EMWEBSITEN_CCACHE_PROGRAM ccache)

if(EMWEBSITEN_CCACHE_PROGRAM)
    message(STATUS "ccache found: ${EMWEBSITEN_CCACHE_PROGRAM}")
    message(STATUS "ccache enabled for C/C++ compilation")
    set(CMAKE_C_COMPILER_LAUNCHER   ${EMWEBSITEN_CCACHE_PROGRAM})
    set(CMAKE_CXX_COMPILER_LAUNCHER ${EMWEBSITEN_CCACHE_PROGRAM})
else()
    message(STATUS "ccache not found — builds will proceed without cache")
endif()

# -----------------------------------------------------------
# Build configuration
# -----------------------------------------------------------
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# -----------------------------------------------------------
# third_party dependencies
# -----------------------------------------------------------
set(THIRD_PARTY_DIR ${CMAKE_SOURCE_DIR}/third_party)

set(MD4C_DIR      ${THIRD_PARTY_DIR}/md4c)
set(STB_DIR       ${THIRD_PARTY_DIR}/stb)
set(FREETYPE_DIR  ${THIRD_PARTY_DIR}/freetype)

# Silence legacy policy warnings from third_party projects
set(CMAKE_POLICY_DEFAULT_CMP0048 NEW)
set(CMAKE_POLICY_DEFAULT_CMP0077 NEW)

# --- md4c (for markdown)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
add_subdirectory(${MD4C_DIR})

# --- stb (header-only)
add_library(stb INTERFACE)
target_include_directories(stb INTERFACE ${STB_DIR})

# -----------------------------------------------------------
# Sources
# -----------------------------------------------------------

file(GLOB_RECURSE EMWEBSITEN_CORE_SOURCES
    CONFIGURE_DEPENDS
    ${CMAKE_SOURCE_DIR}/src/core/*.cc
    ${CMAKE_SOURCE_DIR}/src/core/*.cpp
)

file(GLOB_RECURSE EMWEBSITEN_GL_SOURCES
    CONFIGURE_DEPENDS
    ${CMAKE_SOURCE_DIR}/src/gl/*.cc
    ${CMAKE_SOURCE_DIR}/src/gl/*.cpp
)

file(GLOB_RECURSE EMWEBSITEN_SCENE_SOURCES
    CONFIGURE_DEPENDS
    ${CMAKE_SOURCE_DIR}/src/scene/*.cc
    ${CMAKE_SOURCE_DIR}/src/scene/*.cpp
)

set(EMWEBSITEN_SITE_SOURCES
    src/main.cpp
    ${EMWEBSITEN_CORE_SOURCES}
    ${EMWEBSITEN_GL_SOURCES}
    ${EMWEBSITEN_SCENE_SOURCES}
)

add_executable(${PROJECT_NAME} ${EMWEBSITEN_SITE_SOURCES})

target_compile_options(${PROJECT_NAME}
    PRIVATE
        -Wall
        -Wextra
        -Wpedantic
)

# -----------------------------------------------------------
# Includes
# -----------------------------------------------------------
target_include_directories(${PROJECT_NAME}
    PRIVATE
        ${CMAKE_SOURCE_DIR}/src
        ${CMAKE_SOURCE_DIR}/include
        ${MD4C_DIR}/src
        ${STB_DIR}
)

# -----------------------------------------------------------
# Assets (Emscripten Virtual FS)
# -----------------------------------------------------------

set(EMWEBSITEN_ASSETS_DIR "${CMAKE_SOURCE_DIR}/assets")

set(EMWEBSITEN_ASSET_FILES "")
set(EMWEBSITEN_ASSET_VFS_PATHS "")

emwebsiten_assets_setup(${PROJECT_NAME} ${EMWEBSITEN_ASSETS_DIR})

target_link_options(${PROJECT_NAME}
    PRIVATE
        -sUSE_WEBGL2=1
        -sWASM=1
        -sALLOW_MEMORY_GROWTH=1
)

# -----------------------------------------------------------
# Link libraries
# -----------------------------------------------------------
target_link_libraries(${PROJECT_NAME}
    PRIVATE
        md4c
        stb
)

# -----------------------------------------------------------
# Output
# -----------------------------------------------------------
set_target_properties(${PROJECT_NAME} PROPERTIES
    OUTPUT_NAME "site"
)

# -----------------------------------------------------------
# Derived / Dynamic Build Info
# -----------------------------------------------------------
if(CMAKE_CROSSCOMPILING)
    set(EMWEBSITEN_TOOLCHAIN_NAME "Emscripten")
else()
    set(EMWEBSITEN_TOOLCHAIN_NAME "${CMAKE_CXX_COMPILER_ID}")
endif()

if(EMWEBSITEN_PRELOAD_ASSETS)
    set(EMWEBSITEN_ASSETS_STATUS "ENABLED (${EMWEBSITEN_ASSETS_DIR})")
else()
    set(EMWEBSITEN_ASSETS_STATUS "DISABLED")
endif()

if(TARGET md4c)
    set(EMWEBSITEN_MD4C_STATUS "ON")
else()
    set(EMWEBSITEN_MD4C_STATUS "OFF")
endif()

if(TARGET stb)
    set(EMWEBSITEN_STB_STATUS "ON")
else()
    set(EMWEBSITEN_STB_STATUS "OFF")
endif()

get_property(EMWEBSITEN_COMPILE_FLAGS TARGET ${PROJECT_NAME} PROPERTY COMPILE_OPTIONS)
string(JOIN " " EMWEBSITEN_COMPILE_FLAGS_STR ${EMWEBSITEN_COMPILE_FLAGS})

# -----------------------------------------------------------
# Diagnostics Summary
# -----------------------------------------------------------
set(LINE_TOP    "┌──────────────────────── Build Summary ─────────────────────────┐")
set(LINE_BOTTOM "└────────────────────────────────────────────────────────────────┘")
set(SEP         "│")

message(STATUS "${LINE_TOP}")
message(STATUS "${SEP}  Project Name     : ${PROJECT_NAME}")
message(STATUS "${SEP}  Build Type       : ${CMAKE_BUILD_TYPE}")
message(STATUS "${SEP}  Toolchain        : ${EMWEBSITEN_TOOLCHAIN_NAME}")
message(STATUS "${SEP}  C++ Standard     : C++${CMAKE_CXX_STANDARD}")
message(STATUS "${SEP}  Source Directory : ${CMAKE_SOURCE_DIR}")
message(STATUS "${SEP}")
message(STATUS "${SEP}  ── Web Capabilities ─────────────────────────────")
message(STATUS "${SEP}  • WebGL2         : ENABLED")
message(STATUS "${SEP}  • WASM           : ${CMAKE_CROSSCOMPILING}")
message(STATUS "${SEP}  • Assets FS      : ${EMWEBSITEN_ASSETS_STATUS}")
message(STATUS "${SEP}")
message(STATUS "${SEP}  ── third_party ──────────────────────────────────")
message(STATUS "${SEP}  • md4c           : ${EMWEBSITEN_MD4C_STATUS}")
message(STATUS "${SEP}  • stb            : ${EMWEBSITEN_STB_STATUS}")
message(STATUS "${SEP}")
message(STATUS "${SEP}  ── Compiler Flags ───────────────────────────────")
message(STATUS "${SEP}    ${EMWEBSITEN_COMPILE_FLAGS_STR}")
message(STATUS "${LINE_BOTTOM}")
