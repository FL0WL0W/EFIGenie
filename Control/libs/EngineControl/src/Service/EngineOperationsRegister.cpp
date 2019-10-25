#include "Service/EngineOperationsRegister.h"
#include "Operations/Operation_EnginePosition.h"
#include "Operations/Operation_EnginePositionPrediction.h"

#ifdef ENGINEOPERATIONSREGISTER_H
using namespace Operations;

namespace Service
{
	void EngineOperationsRegister::Register()
    {
        /*2001  */Operation_EnginePosition::RegisterFactory();
        /*2002  */Operation_EnginePositionPrediction::RegisterFactory();
    }
}
#endif
