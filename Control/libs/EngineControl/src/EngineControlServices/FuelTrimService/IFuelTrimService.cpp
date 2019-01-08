#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"

namespace EngineControlServices
{
	void IFuelTrimService::TickCallBack(void *fuelTrimService)
	{
		((IFuelTrimService*)fuelTrimService)->Tick();
	}
}