#include "Service/ReluctorOperationsRegister.h"
#include "Operations/Operation_ReluctorGM24x.h"
#include "Operations/Operation_ReluctorUniversal2x.h"

#ifdef RELUCTOROPERATIONSREGISTER_H
using namespace Operations;

namespace Service
{
	void ReluctorOperationsRegister::Register()
    {
        /*1001  */Operation_ReluctorGM24x::RegisterFactory();
        /*1002  */Operation_ReluctorUniversal2x::RegisterFactory();
    }
}
#endif
