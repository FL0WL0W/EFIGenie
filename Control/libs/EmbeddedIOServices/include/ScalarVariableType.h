#include <stdint.h>

#ifndef SCALARVARIABLETYPE_H
#define SCALARVARIABLETYPE_H
enum ScalarVariableType : uint8_t
{
    VOID = 0,
    UINT8 = 1,
    UINT16 = 2,
    UINT32 = 3,
    UINT64 = 4,
    INT8 = 5,
    INT16 = 6,
    INT32 = 7,
    INT64 = 8,
    FLOAT = 9,
    DOUBLE = 10,
    BOOLEAN = 11,
    TICK = 12
};
constexpr uint8_t ScalarVariableTypeSizeOf(ScalarVariableType type)
{
    switch(type)
    {
        case ScalarVariableType::UINT8: return sizeof(uint8_t);
        case ScalarVariableType::UINT16: return sizeof(uint16_t);
        case ScalarVariableType::UINT32: return sizeof(uint32_t);
        case ScalarVariableType::TICK: return sizeof(uint32_t);
        case ScalarVariableType::UINT64: return sizeof(uint64_t);
        case ScalarVariableType::INT8: return sizeof(int8_t);
        case ScalarVariableType::INT16: return sizeof(int16_t);
        case ScalarVariableType::INT32: return sizeof(int32_t);
        case ScalarVariableType::INT64: return sizeof(int64_t);
        case ScalarVariableType::FLOAT: return sizeof(float);
        case ScalarVariableType::DOUBLE: return sizeof(double);
        case ScalarVariableType::BOOLEAN: return sizeof(bool);
        case ScalarVariableType::VOID: 
            break;
            //this is bad 
    }
    return 0;
}
#endif