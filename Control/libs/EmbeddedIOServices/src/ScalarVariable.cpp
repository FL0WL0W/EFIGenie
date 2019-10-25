#include "ScalarVariable.h"

#ifdef SCALARVARIABLE_H
template<>
bool ScalarVariableTo<bool>(ScalarVariable *scalarVariable)
{
    switch(scalarVariable->Type)
    {
        case ScalarVariableType::BOOLEAN: return *reinterpret_cast<bool *>(&scalarVariable->Value);
    }
    return false;
}
#endif