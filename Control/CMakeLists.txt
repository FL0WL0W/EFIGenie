# CMakeList.txt : Top-level CMake project file, do global configuration
# and include sub-projects here.
#
cmake_minimum_required (VERSION 3.8)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)

set(LIBRARIES	libs)

project(TopLevelBuild CXX)

add_subdirectory (${LIBRARIES}/EmbeddedIOServices)
add_subdirectory (${LIBRARIES}/Reluctor)
add_subdirectory (${LIBRARIES}/EngineControl)
add_subdirectory (${LIBRARIES}/TransmissionControl)

add_subdirectory (${LIBRARIES}/googletest)
enable_testing()

add_subdirectory (${LIBRARIES}/EmbeddedIOServicesMockedObjects)
add_subdirectory (${LIBRARIES}/EngineControlMockedObjects)
add_subdirectory (${LIBRARIES}/EngineControlUnitTests)
