# CMakeList.txt : CMake project for EmbeddedIOServicesUnitTests, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.8)

set(TARGET		EngineControlUnitTests)

project(${TARGET} CXX)

# headers are always in include/
set(HDR_DIR		include)
file(GLOB_RECURSE HDRS ${HDR_DIR}/*.h)
include_directories(${HDR_DIR})
# sources are always in src/
set(SRCS_DIR	src)
file(GLOB_RECURSE SRCS ${SRCS_DIR}/*.cpp)

# create executable
add_executable(${TARGET} ${SRCS})

# link static libraries
target_link_libraries(${TARGET} EmbeddedIOServices)
target_link_libraries(${TARGET} EmbeddedIOServicesMockedObjects)
target_link_libraries(${TARGET} Reluctor)
target_link_libraries(${TARGET} ReluctorMockedObjects)
target_link_libraries(${TARGET} EngineControl)
target_link_libraries(${TARGET} EngineControlMockedObjects)
target_link_libraries(${TARGET} gtest gtest_main gmock)

add_test(ALLTESTS ${TARGET})