#include <stdint.h>
#include "ScalarVariableType.h"

#ifndef SCALARVARIABLE_H
#define SCALARVARIABLE_H
struct ScalarVariable
{
    ScalarVariableType Type;
    uint64_t Value;

    ScalarVariable()
    {
        Type = ScalarVariableType::UINT8;
        Value = 0;
    }
    ScalarVariable(uint8_t variable)
    {
        Type = ScalarVariableType::UINT8;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(uint16_t variable)
    {
        Type = ScalarVariableType::UINT16;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(uint32_t variable)
    {
        Type = ScalarVariableType::UINT32;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(uint64_t variable)
    {
        Type = ScalarVariableType::UINT64;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(int8_t variable)
    {
        Type = ScalarVariableType::INT8;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(int16_t variable)
    {
        Type = ScalarVariableType::INT16;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(int32_t variable)
    {
        Type = ScalarVariableType::INT32;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(int64_t variable)
    {
        Type = ScalarVariableType::INT64;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(float variable)
    {
        Type = ScalarVariableType::FLOAT;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(double variable)
    {
        Type = ScalarVariableType::DOUBLE;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    ScalarVariable(bool variable)
    {
        Type = ScalarVariableType::BOOLEAN;
        Value = *reinterpret_cast<uint64_t *>(&variable);
    }
    static ScalarVariable FromTick(uint32_t tick)
    {
        ScalarVariable ret = ScalarVariable(tick);
        ret.Type = TICK;
        return ret;
    }

    template<typename K>
    K To()
    {
        switch(Type)
        {
            case ScalarVariableType::UINT8: return static_cast<K>(*reinterpret_cast<uint8_t *>(&Value));
            case ScalarVariableType::UINT16: return static_cast<K>(*reinterpret_cast<uint16_t *>(&Value));
            case ScalarVariableType::UINT32: return static_cast<K>(*reinterpret_cast<uint32_t *>(&Value));
            case ScalarVariableType::TICK: return static_cast<K>(*reinterpret_cast<uint32_t *>(&Value));
            case ScalarVariableType::UINT64: return static_cast<K>(*reinterpret_cast<uint64_t *>(&Value));
            case ScalarVariableType::INT8: if(static_cast<K>(-1) > 0 && *reinterpret_cast<int8_t *>(&Value) < 0) return 0; return static_cast<K>(*reinterpret_cast<int8_t *>(&Value));
            case ScalarVariableType::INT16: if(static_cast<K>(-1) > 0 && *reinterpret_cast<int16_t *>(&Value) < 0) return 0; return static_cast<K>(*reinterpret_cast<int16_t *>(&Value));
            case ScalarVariableType::INT32: if(static_cast<K>(-1) > 0 && *reinterpret_cast<int32_t *>(&Value) < 0) return 0; return static_cast<K>(*reinterpret_cast<int32_t *>(&Value));
            case ScalarVariableType::INT64: if(static_cast<K>(-1) > 0 && *reinterpret_cast<int64_t *>(&Value) < 0) return 0; return static_cast<K>(*reinterpret_cast<int64_t *>(&Value));
            case ScalarVariableType::FLOAT: if(static_cast<K>(-1) > 0 && *reinterpret_cast<float *>(&Value) < 0) return 0; return static_cast<K>(*reinterpret_cast<float *>(&Value));
            case ScalarVariableType::DOUBLE: if(static_cast<K>(-1) > 0 && *reinterpret_cast<double *>(&Value) < 0) return 0; return static_cast<K>(*reinterpret_cast<double *>(&Value));
            case ScalarVariableType::BOOLEAN: return static_cast<K>(*reinterpret_cast<bool *>(&Value));
        }
        return 0;
    }
    template<>
    bool To<bool>()
    {
        switch(Type)
        {
            case ScalarVariableType::BOOLEAN: return *reinterpret_cast<bool *>(&Value);
        }
        return false;
    }

    static ScalarVariable Int64ToScalarVariable(int64_t result, ScalarVariableType targetType)
    {
        switch(targetType)
        {
            case UINT8:
                if(result > static_cast<int64_t>(4294967295))
                    return ScalarVariable(static_cast<uint64_t>(result));
                if(result > 65535)
                    return ScalarVariable(static_cast<uint32_t>(result));
                if(result > 255)
                    return ScalarVariable(static_cast<uint16_t>(result));
                if(result < -static_cast<int64_t>(2147483648))
                    return ScalarVariable(static_cast<int64_t>(result));
                if(result < -32768)
                    return ScalarVariable(static_cast<int32_t>(result));
                if(result < -128)
                    return ScalarVariable(static_cast<int16_t>(result));
                if(result < 0)
                    return ScalarVariable(static_cast<int8_t>(result));
                return ScalarVariable(static_cast<uint8_t>(result));
            case INT8:
                if(result > static_cast<int64_t>(2147483648) || result < -static_cast<int64_t>(2147483648))
                    return ScalarVariable(result);
                if(result > 32767 || result < -32768)
                    return ScalarVariable(static_cast<int32_t>(result));
                if(result > 127 || result < -128)
                    return ScalarVariable(static_cast<int16_t>(result));
                return ScalarVariable(static_cast<int8_t>(result));
            case UINT16:
                if(result > static_cast<int64_t>(4294967295))
                    return ScalarVariable(static_cast<uint64_t>(result));
                if(result < -static_cast<int64_t>(2147483648))
                    return ScalarVariable(static_cast<int64_t>(result));
                if(result > 65535)
                    return ScalarVariable(static_cast<uint32_t>(result));
                if(result < -32768)
                    return ScalarVariable(static_cast<int32_t>(result));
                if(result < 0)
                    return ScalarVariable(static_cast<int16_t>(result));
                return ScalarVariable(static_cast<uint16_t>(result));
            case INT16:
                if(result > static_cast<int64_t>(2147483648) || result < -static_cast<int64_t>(2147483648))
                    return ScalarVariable(result);
                if(result > 32767 || result < -32768)
                    return ScalarVariable(static_cast<int32_t>(result));
                return ScalarVariable(static_cast<int16_t>(result));
            case UINT32:
                if(result > static_cast<int64_t>(4294967295))
                    return ScalarVariable(static_cast<uint64_t>(result));
                if(result < -static_cast<int64_t>(2147483648))
                    return ScalarVariable(static_cast<int64_t>(result));
                if(result < 0)
                    return ScalarVariable(static_cast<int32_t>(result));
                return ScalarVariable(static_cast<uint32_t>(result));
            case INT32:
                if(result > static_cast<int64_t>(2147483648) || result < -static_cast<int64_t>(2147483648))
                    return ScalarVariable(result);
                return ScalarVariable(static_cast<int32_t>(result));
            case UINT64:
                if(result < 0)
                    return ScalarVariable(static_cast<int64_t>(result));
                return ScalarVariable(static_cast<uint64_t>(result));
        }
        return ScalarVariable(result);
    }

    ScalarVariable operator+(ScalarVariable a)
    {
        if(Type == BOOLEAN || a.Type == BOOLEAN)
        {
            if(Type == BOOLEAN && a.Type == BOOLEAN)
            {
                return ScalarVariable(To<bool>() || a.To<bool>());
            }
        }
        if(Type == TICK)
        {
            switch(a.Type)
            {
                case ScalarVariableType::UINT8: return ScalarVariable::FromTick(To<uint32_t>() + a.To<uint8_t>());
                case ScalarVariableType::UINT16: return ScalarVariable::FromTick(To<uint32_t>() + a.To<uint16_t>());
                case ScalarVariableType::UINT32: return ScalarVariable::FromTick(To<uint32_t>() + a.To<uint32_t>());
                case ScalarVariableType::TICK: return ScalarVariable::FromTick(To<uint32_t>() + a.To<uint32_t>());
                case ScalarVariableType::UINT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() + a.To<uint64_t>()));
                case ScalarVariableType::INT8: return ScalarVariable::FromTick(To<uint32_t>() + a.To<int8_t>());
                case ScalarVariableType::INT16: return ScalarVariable::FromTick(To<uint32_t>() + a.To<int16_t>());
                case ScalarVariableType::INT32: return ScalarVariable::FromTick(To<uint32_t>() + a.To<int32_t>());
                case ScalarVariableType::INT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() + a.To<int64_t>()));
                case ScalarVariableType::FLOAT: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() + a.To<float>()));
                case ScalarVariableType::DOUBLE: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() + a.To<double>()));
            }
        }
        if(a.Type == TICK)
        {
            switch(Type)
            {
                case ScalarVariableType::UINT8: return ScalarVariable::FromTick(To<uint8_t>() + a.To<uint32_t>());
                case ScalarVariableType::UINT16: return ScalarVariable::FromTick(To<uint16_t>() + a.To<uint32_t>());
                case ScalarVariableType::UINT32: return ScalarVariable::FromTick(To<uint32_t>() + a.To<uint32_t>());
                case ScalarVariableType::TICK: return ScalarVariable::FromTick(To<uint32_t>() + a.To<uint32_t>());
                case ScalarVariableType::UINT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint64_t>() + a.To<uint32_t>()));
                case ScalarVariableType::INT8: return ScalarVariable::FromTick(To<int8_t>() + a.To<uint32_t>());
                case ScalarVariableType::INT16: return ScalarVariable::FromTick(To<int16_t>() + a.To<uint32_t>());
                case ScalarVariableType::INT32: return ScalarVariable::FromTick(To<int32_t>() + a.To<uint32_t>());
                case ScalarVariableType::INT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<int64_t>() + a.To<uint32_t>()));
                case ScalarVariableType::FLOAT: return ScalarVariable::FromTick(static_cast<uint32_t>(To<float>() + a.To<uint32_t>()));
                case ScalarVariableType::DOUBLE: return ScalarVariable::FromTick(static_cast<uint32_t>(To<double>() + a.To<uint32_t>()));
            }
        }
        if(Type == DOUBLE || a.Type == DOUBLE)
        {
            return ScalarVariable(To<double>() + a.To<double>());
        }
        if(Type == FLOAT || a.Type == FLOAT)
        {
            return ScalarVariable(To<float>() + a.To<float>());
        }
        uint64_t preResult = To<uint64_t>() + a.To<uint64_t>();
        if(preResult > 9223372036854775807)
            return ScalarVariable(static_cast<uint64_t>(preResult));
        int64_t result = To<int64_t>() + a.To<int64_t>();
        return Int64ToScalarVariable(result, Type);
    }
    ScalarVariable operator-(ScalarVariable a)
    {
        if(Type == BOOLEAN || a.Type == BOOLEAN)
        {
            if(Type == BOOLEAN && a.Type == BOOLEAN)
            {
                return ScalarVariable(To<bool>() || !a.To<bool>());
            }
        }
        if(Type == TICK)
        {
            switch(a.Type)
            {
                case ScalarVariableType::UINT8: return ScalarVariable::FromTick(To<uint32_t>() - a.To<uint8_t>());
                case ScalarVariableType::UINT16: return ScalarVariable::FromTick(To<uint32_t>() - a.To<uint16_t>());
                case ScalarVariableType::UINT32: return ScalarVariable::FromTick(To<uint32_t>() - a.To<uint32_t>());
                case ScalarVariableType::TICK: return ScalarVariable::FromTick(To<uint32_t>() - a.To<uint32_t>());
                case ScalarVariableType::UINT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() - a.To<uint64_t>()));
                case ScalarVariableType::INT8: return ScalarVariable::FromTick(To<uint32_t>() - a.To<int8_t>());
                case ScalarVariableType::INT16: return ScalarVariable::FromTick(To<uint32_t>() - a.To<int16_t>());
                case ScalarVariableType::INT32: return ScalarVariable::FromTick(To<uint32_t>() - a.To<int32_t>());
                case ScalarVariableType::INT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() - a.To<int64_t>()));
                case ScalarVariableType::FLOAT: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() - a.To<float>()));
                case ScalarVariableType::DOUBLE: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() - a.To<double>()));
            }
        }
        if(a.Type == TICK)
        {
            switch(Type)
            {
                case ScalarVariableType::UINT8: return ScalarVariable::FromTick(To<uint8_t>() - a.To<uint32_t>());
                case ScalarVariableType::UINT16: return ScalarVariable::FromTick(To<uint16_t>() - a.To<uint32_t>());
                case ScalarVariableType::UINT32: return ScalarVariable::FromTick(To<uint32_t>() - a.To<uint32_t>());
                case ScalarVariableType::TICK: return ScalarVariable::FromTick(To<uint32_t>() - a.To<uint32_t>());
                case ScalarVariableType::UINT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint64_t>() - a.To<uint32_t>()));
                case ScalarVariableType::INT8: return ScalarVariable::FromTick(To<int8_t>() - a.To<uint32_t>());
                case ScalarVariableType::INT16: return ScalarVariable::FromTick(To<int16_t>() - a.To<uint32_t>());
                case ScalarVariableType::INT32: return ScalarVariable::FromTick(To<int32_t>() - a.To<uint32_t>());
                case ScalarVariableType::INT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<int64_t>() - a.To<uint32_t>()));
                case ScalarVariableType::FLOAT: return ScalarVariable::FromTick(static_cast<uint32_t>(To<float>() - a.To<uint32_t>()));
                case ScalarVariableType::DOUBLE: return ScalarVariable::FromTick(static_cast<uint32_t>(To<double>() - a.To<uint32_t>()));
            }
        }
        if(Type == DOUBLE || a.Type == DOUBLE)
        {
            return ScalarVariable(To<double>() - a.To<double>());
        }
        if(Type == FLOAT || a.Type == FLOAT)
        {
            return ScalarVariable(To<float>() - a.To<float>());
        }
        if(To<uint64_t>() > a.To<uint64_t>())
        {
            uint64_t preResult = To<uint64_t>() - a.To<uint64_t>();
            if(preResult > 9223372036854775807)
                return ScalarVariable(static_cast<uint64_t>(preResult));
        }
        int64_t result = To<int64_t>() - a.To<int64_t>();
        return Int64ToScalarVariable(result, Type);
    }
    ScalarVariable operator*(ScalarVariable a)
    {
        if(Type == BOOLEAN || a.Type == BOOLEAN)
        {
            if(Type == BOOLEAN && a.Type == BOOLEAN)
            {
                return ScalarVariable(To<bool>() && a.To<bool>());
            }
        }
        if(Type == TICK)
        {
            switch(a.Type)
            {
                case ScalarVariableType::UINT8: return ScalarVariable::FromTick(To<uint32_t>() * a.To<uint8_t>());
                case ScalarVariableType::UINT16: return ScalarVariable::FromTick(To<uint32_t>() * a.To<uint16_t>());
                case ScalarVariableType::UINT32: return ScalarVariable::FromTick(To<uint32_t>() * a.To<uint32_t>());
                case ScalarVariableType::TICK: return ScalarVariable::FromTick(To<uint32_t>() * a.To<uint32_t>());
                case ScalarVariableType::UINT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() * a.To<uint64_t>()));
                case ScalarVariableType::INT8: return ScalarVariable::FromTick(To<uint32_t>() * a.To<int8_t>());
                case ScalarVariableType::INT16: return ScalarVariable::FromTick(To<uint32_t>() * a.To<int16_t>());
                case ScalarVariableType::INT32: return ScalarVariable::FromTick(To<uint32_t>() * a.To<int32_t>());
                case ScalarVariableType::INT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() * a.To<int64_t>()));
                case ScalarVariableType::FLOAT: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() * a.To<float>()));
                case ScalarVariableType::DOUBLE: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() * a.To<double>()));
            }
        }
        if(a.Type == TICK)
        {
            switch(Type)
            {
                case ScalarVariableType::UINT8: return ScalarVariable::FromTick(To<uint8_t>() * a.To<uint32_t>());
                case ScalarVariableType::UINT16: return ScalarVariable::FromTick(To<uint16_t>() * a.To<uint32_t>());
                case ScalarVariableType::UINT32: return ScalarVariable::FromTick(To<uint32_t>() * a.To<uint32_t>());
                case ScalarVariableType::TICK: return ScalarVariable::FromTick(To<uint32_t>() * a.To<uint32_t>());
                case ScalarVariableType::UINT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint64_t>() * a.To<uint32_t>()));
                case ScalarVariableType::INT8: return ScalarVariable::FromTick(To<int8_t>() * a.To<uint32_t>());
                case ScalarVariableType::INT16: return ScalarVariable::FromTick(To<int16_t>() * a.To<uint32_t>());
                case ScalarVariableType::INT32: return ScalarVariable::FromTick(To<int32_t>() * a.To<uint32_t>());
                case ScalarVariableType::INT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<int64_t>() * a.To<uint32_t>()));
                case ScalarVariableType::FLOAT: return ScalarVariable::FromTick(static_cast<uint32_t>(To<float>() * a.To<uint32_t>()));
                case ScalarVariableType::DOUBLE: return ScalarVariable::FromTick(static_cast<uint32_t>(To<double>() * a.To<uint32_t>()));
            }
        }
        if(Type == DOUBLE || a.Type == DOUBLE)
        {
            return ScalarVariable(To<double>() * a.To<double>());
        }
        if(Type == FLOAT || a.Type == FLOAT)
        {
            return ScalarVariable(To<float>() * a.To<float>());
        }
        uint64_t preResult = To<uint64_t>() * a.To<uint64_t>();
        if(preResult > 9223372036854775807)
            return ScalarVariable(static_cast<uint64_t>(preResult));
        int64_t result = To<int64_t>() * a.To<int64_t>();
        return Int64ToScalarVariable(result, Type);
    }
    ScalarVariable operator/(ScalarVariable a)
    {
        if(Type == BOOLEAN || a.Type == BOOLEAN)
        {
            if(Type == BOOLEAN && a.Type == BOOLEAN)
            {
                return ScalarVariable(To<bool>() && !a.To<bool>());
            }
        }
        if(Type == TICK)
        {
            switch(a.Type)
            {
                case ScalarVariableType::UINT8: return ScalarVariable::FromTick(To<uint32_t>() / a.To<uint8_t>());
                case ScalarVariableType::UINT16: return ScalarVariable::FromTick(To<uint32_t>() / a.To<uint16_t>());
                case ScalarVariableType::UINT32: return ScalarVariable::FromTick(To<uint32_t>() / a.To<uint32_t>());
                case ScalarVariableType::TICK: return ScalarVariable::FromTick(To<uint32_t>() / a.To<uint32_t>());
                case ScalarVariableType::UINT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() / a.To<uint64_t>()));
                case ScalarVariableType::INT8: return ScalarVariable::FromTick(To<uint32_t>() / a.To<int8_t>());
                case ScalarVariableType::INT16: return ScalarVariable::FromTick(To<uint32_t>() / a.To<int16_t>());
                case ScalarVariableType::INT32: return ScalarVariable::FromTick(To<uint32_t>() / a.To<int32_t>());
                case ScalarVariableType::INT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() / a.To<int64_t>()));
                case ScalarVariableType::FLOAT: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() / a.To<float>()));
                case ScalarVariableType::DOUBLE: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint32_t>() / a.To<double>()));
            }
        }
        if(a.Type == TICK)
        {
            switch(Type)
            {
                case ScalarVariableType::UINT8: return ScalarVariable::FromTick(To<uint8_t>() / a.To<uint32_t>());
                case ScalarVariableType::UINT16: return ScalarVariable::FromTick(To<uint16_t>() / a.To<uint32_t>());
                case ScalarVariableType::UINT32: return ScalarVariable::FromTick(To<uint32_t>() / a.To<uint32_t>());
                case ScalarVariableType::TICK: return ScalarVariable::FromTick(To<uint32_t>() / a.To<uint32_t>());
                case ScalarVariableType::UINT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<uint64_t>() / a.To<uint32_t>()));
                case ScalarVariableType::INT8: return ScalarVariable::FromTick(To<int8_t>() / a.To<uint32_t>());
                case ScalarVariableType::INT16: return ScalarVariable::FromTick(To<int16_t>() / a.To<uint32_t>());
                case ScalarVariableType::INT32: return ScalarVariable::FromTick(To<int32_t>() / a.To<uint32_t>());
                case ScalarVariableType::INT64: return ScalarVariable::FromTick(static_cast<uint32_t>(To<int64_t>() / a.To<uint32_t>()));
                case ScalarVariableType::FLOAT: return ScalarVariable::FromTick(static_cast<uint32_t>(To<float>() / a.To<uint32_t>()));
                case ScalarVariableType::DOUBLE: return ScalarVariable::FromTick(static_cast<uint32_t>(To<double>() / a.To<uint32_t>()));
            }
        }
        if(Type == DOUBLE || a.Type == DOUBLE)
        {
            return ScalarVariable(To<double>() / a.To<double>());
        }
        if(Type == FLOAT || a.Type == FLOAT)
        {
            return ScalarVariable(To<float>() / a.To<float>());
        }
        if(a.To<uint64_t>() != 0)
        {
            uint64_t preResult = To<uint64_t>() / a.To<uint64_t>();
            if(preResult > 9223372036854775807)
                return ScalarVariable(static_cast<uint64_t>(preResult));
        }
        if(a.To<int64_t>() == 0)
            return ScalarVariable(false);
        int64_t result = To<int64_t>() / a.To<int64_t>();
        return Int64ToScalarVariable(result, Type);
    }
    ScalarVariable operator&(ScalarVariable a)
    {
        ScalarVariable ret = *this;
        ret.Value &= a.Value;
        return ret;
    }
    ScalarVariable operator|(ScalarVariable a)
    {
        ScalarVariable ret = *this;
        ret.Value |= a.Value;
        return ret;
    }
    bool operator==(ScalarVariable a)
    {
        if(Type == DOUBLE || a.Type == DOUBLE)
            return To<double>() == a.To<double>();
        if(Type == FLOAT || a.Type == FLOAT)
            return To<float>() == a.To<float>();
        if(Type == TICK || a.Type == TICK)
            return To<uint32_t>() == a.To<uint32_t>();
        if(Type == UINT64 && a.Type == UINT64)
            return To<uint64_t>() == a.To<uint64_t>();
        if(Type == UINT64 && To<uint64_t>() > 9223372036854775807)
            return false;
        if(a.Type == UINT64 && a.To<uint64_t>() > 9223372036854775807)
            return false;
        if(Type == BOOLEAN || a.Type == BOOLEAN)
            return To<bool>() == a.To<bool>();
        return To<int64_t>() == a.To<int64_t>();
    }
    bool operator<(ScalarVariable a)
    {
        if(Type == DOUBLE || a.Type == DOUBLE)
            return To<double>() < a.To<double>();
        if(Type == FLOAT || a.Type == FLOAT)
            return To<float>() < a.To<float>();
        if(Type == TICK || a.Type == TICK)
            return To<uint32_t>() - a.To<uint32_t>() >= 0x80000000;
        if(Type == UINT64 && a.Type == UINT64)
            return To<uint64_t>() < a.To<uint64_t>();
        if(Type == UINT64 && To<uint64_t>() >= 9223372036854775807)
            return false;
        if(a.Type == UINT64 && a.To<uint64_t>() >= 9223372036854775807)
            return true;
        if(Type == BOOLEAN || a.Type == BOOLEAN)
            return static_cast<bool>(0);
        return To<int64_t>() < a.To<int64_t>();
    }
    bool operator>(ScalarVariable a)
    {
        return a < *this;
    }
    bool operator>=(ScalarVariable a)
    {
        return !(*this < a);
    }
    bool operator<=(ScalarVariable a)
    {
        return !(a < *this);
    }
};
#endif