#include "EngineControlServices/RpmService/RpmService.h"

#ifdef RPMSERVICE_H
namespace EngineControlServices
{
	RpmService::RpmService(IReluctor *crankReluctor, IReluctor *camReluctor)
	{
		_crankReluctor = crankReluctor;
		_camReluctor = camReluctor;
	}
	
	void RpmService::Tick()
	{
		bool crankAvailable = _crankReluctor != 0? _crankReluctor->IsSynced() : false;
		bool camAvailable = _camReluctor != 0? _camReluctor->IsSynced() : false;

		if(crankAvailable && (!camAvailable || _crankReluctor->GetResolution() >= _camReluctor->GetResolution()))
			Rpm = _crankReluctor->GetRpm();
		else if(camAvailable)
			Rpm = _camReluctor->GetRpm();
		else
			Rpm = 0;
	}
	
	void RpmService::TickCallBack(void *rpmService)
	{
		((RpmService*)rpmService)->Tick();
	}
}
#endif