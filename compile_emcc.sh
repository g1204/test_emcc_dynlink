#!/bin/bash

# source "/Users/foxit/repos/emsdk/emsdk_env.sh"
# which emcc

em++ --bind -s MAIN_MODULE=1 main_module.cpp -o main_module.js \
    -sMODULARIZE=1 -sEXPORT_NAME=MODULE \
    -sEXTRA_EXPORTED_RUNTIME_METHODS=[loadDynamicLibrary] \
    

    # -s EXPORT_ALL=1 \
    # -s NO_FILESYSTEM=1 \
    # -sRUNTIME_LINKED_LIBS=[side_module.wasm] \

em++ -s SIDE_MODULE=1 side_module.cpp -o side_module.wasm \

    # -s EXPORT_ALL=1 -s NO_FILESYSTEM=1 
