#include "Service/EngineOperationsRegister.h"
#include "Operations/Operation_EnginePosition.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include "Operations/Operation_EngineScheduleIgnition.h"
#include "Operations/Operation_EngineScheduleInjection.h"
#include "Operations/Operation_EngineScheduleIgnitionArray.h"
#include "Operations/Operation_EngineScheduleInjectionArray.h"

#ifdef ENGINEOPERATIONSREGISTER_H
using namespace Operations;

namespace Service
{
	void EngineOperationsRegister::Register()
    {
        /*2001  */Operation_EnginePosition::RegisterFactory();
        /*2002  */Operation_EnginePositionPrediction::RegisterFactory();
        /*2003  */Operation_EngineScheduleIgnition::RegisterFactory();
        /*2004  */Operation_EngineScheduleInjection::RegisterFactory();
        /*2005  */Operation_EngineScheduleIgnitionArray::RegisterFactory();
        /*2006  */Operation_EngineScheduleInjectionArray::RegisterFactory();
    }
}
#endif
