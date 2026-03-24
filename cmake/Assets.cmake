# ===========================================================
# Assets.cmake — Asset + Shader Management System
# ===========================================================

# ANSI colors
string(ASCII 27 ESC)

set(CLR_RESET  "${ESC}[0m")
set(CLR_BOLD   "${ESC}[1m")
set(CLR_RED    "${ESC}[31m")
set(CLR_GREEN  "${ESC}[32m")
set(CLR_YELLOW "${ESC}[33m")
set(CLR_BLUE   "${ESC}[34m")
set(CLR_CYAN   "${ESC}[36m")

function(emwebsiten_assets_setup TARGET ASSET_DIR)

    message(STATUS "${CLR_CYAN}${CLR_BOLD}── Asset System ─────────────────────────────${CLR_RESET}")

    if(NOT EXISTS "${ASSET_DIR}")
        message(WARNING "${CLR_YELLOW}Assets directory missing: ${ASSET_DIR}${CLR_RESET}")
        return()
    endif()

    # -------------------------------------------------------
    # Collect all assets
    # -------------------------------------------------------
    file(GLOB_RECURSE EMWEBSITEN_ASSETS
        CONFIGURE_DEPENDS
        "${ASSET_DIR}/*"
    )

    set(ASSET_COUNT 0)

    foreach(asset IN LISTS EMWEBSITEN_ASSETS)
        math(EXPR ASSET_COUNT "${ASSET_COUNT} + 1")

        get_filename_component(ext "${asset}" EXT)

        # Color based on type
        if(ext MATCHES "\\.(frag|vert|glsl)$")
            set(color ${CLR_GREEN})
            set(tag   "[SHADER]")
        elseif(ext MATCHES "\\.(png|jpg|jpeg|webp)$")
            set(color ${CLR_BLUE})
            set(tag   "[IMAGE]")
        else()
            set(color ${CLR_YELLOW})
            set(tag   "[ASSET]")
        endif()

        message(STATUS "${color}  • ${tag} ${asset}${CLR_RESET}")
    endforeach()

    message(STATUS "${CLR_CYAN}Total assets: ${ASSET_COUNT}${CLR_RESET}")

    set(ASSET_STAMP "${CMAKE_BINARY_DIR}/assets.stamp")

    add_custom_command(
        OUTPUT ${ASSET_STAMP}
        COMMAND ${CMAKE_COMMAND} -E echo "${CLR_BLUE}<!> Checking asset changes...${CLR_RESET}"
        COMMAND ${CMAKE_COMMAND} -E touch ${ASSET_STAMP}
        DEPENDS ${EMWEBSITEN_ASSETS}
        COMMENT "${CLR_GREEN}✔ Asset change detected -> rebuilding bundle${CLR_RESET}"
        VERBATIM
    )

    add_custom_target(${TARGET}_assets ALL
        DEPENDS ${ASSET_STAMP}
    )

    add_dependencies(${TARGET} ${TARGET}_assets)

    set_property(TARGET ${TARGET} APPEND PROPERTY LINK_DEPENDS ${ASSET_STAMP})

    # -------------------------------------------------------
    # Preload directive
    # -------------------------------------------------------
    set(PRELOAD_FLAG "--preload-file=${ASSET_DIR}@/assets")

    target_link_options(${TARGET}
        PRIVATE
        ${PRELOAD_FLAG}
    )

    message(STATUS "${CLR_GREEN}✔ Asset system integrated with target '${TARGET}'${CLR_RESET}")
    message(STATUS "${CLR_CYAN}────────────────────────────────────────────${CLR_RESET}")

endfunction()
