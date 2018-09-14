#include "EngineManagementServices/FuelTrimService/IFuelTrimService.h"

namespace EngineManagementServices
{
	void IFuelTrimService::TickCallBack(void *fuelTrimService)
	{
		((IFuelTrimService*)fuelTrimService)->Tick();
	}
}