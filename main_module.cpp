
int bar();

#include <emscripten/bind.h>
using namespace emscripten;

EMSCRIPTEN_BINDINGS(test_dynlink) {
    function("bar", &bar);
}
