# CMakeList.txt : CMake project for Reluctor, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.8)
option(EFIGenie_build_tests "Build all of EFIGenie tests" OFF)

set(TARGET		EFIGenie)
set(HDR_DIR		include)
set(SRCS_DIR	src)
set(LIBRARIES	libs)

project(${TARGET} CXX)

if (EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/${LIBRARIES}/OperationArchitecture/CMakeLists.txt)
    add_subdirectory (${LIBRARIES}/OperationArchitecture)
endif()
if (EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/${LIBRARIES}/EmbeddedIOServices/CMakeLists.txt)
    add_subdirectory (${LIBRARIES}/EmbeddedIOServices)
endif()
if (EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/${LIBRARIES}/EmbeddedIOOperations/CMakeLists.txt)
    add_subdirectory (${LIBRARIES}/EmbeddedIOOperations)
endif()
if (EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/${LIBRARIES}/ReluctorOperations/CMakeLists.txt)
    add_subdirectory (${LIBRARIES}/ReluctorOperations)
endif()

# headers are always in include/
file(GLOB_RECURSE HDRS ${HDR_DIR}/*.h)
include_directories(${HDR_DIR})
# sources are always in src/
file(GLOB_RECURSE SRCS ${SRCS_DIR}/*.cpp)

# create library
add_library(${TARGET} STATIC ${HDRS} ${SRCS})
target_include_directories(${TARGET} PUBLIC ${HDR_DIR})
target_link_libraries(${TARGET} OperationArchitecture)
target_link_libraries(${TARGET} EmbeddedIOServices)
target_link_libraries(${TARGET} EmbeddedIOOperations)
target_link_libraries(${TARGET} ReluctorOperations)



if(EFIGenie_build_tests)
    #include google test
    if (EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/${LIBRARIES}/googletest/CMakeLists.txt)
        add_subdirectory (${LIBRARIES}/googletest)
    endif()
    #include test
    add_subdirectory(test)
endif()