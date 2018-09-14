# CMakeList.txt : Top-level CMake project file, do global configuration
# and include sub-projects here.
#
cmake_minimum_required (VERSION 3.8)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)

set(LIBRARIES	libs)

project(TopLevelBuild CXX)

add_subdirectory (${LIBRARIES}/EmbeddedIOServices)
add_subdirectory (${LIBRARIES}/CrankCamDecoders)
add_subdirectory (${LIBRARIES}/EngineManagement)

add_subdirectory (${LIBRARIES}/googletest)
enable_testing()

add_subdirectory (${LIBRARIES}/EmbeddedIOServicesMockedObjects)
add_subdirectory (${LIBRARIES}/CrankCamDecodersMockedObjects)
add_subdirectory (${LIBRARIES}/EngineManagementMockedObjects)
add_subdirectory (${LIBRARIES}/EngineManagementUnitTests)
