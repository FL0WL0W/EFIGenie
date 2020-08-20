#include "ScalarVariable.h"

#ifdef SCALARVARIABLE_H
template<>
bool ScalarVariableTo<bool>(ScalarVariable *scalarVariable)
{
    if(scalarVariable->Type == ScalarVariableType::BOOLEAN)
        return *reinterpret_cast<bool *>(&scalarVariable->Value);
    return false;
}
#endif