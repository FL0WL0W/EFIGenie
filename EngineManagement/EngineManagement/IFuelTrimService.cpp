#include "IFuelTrimService.h"

namespace ApplicationService
{
	void IFuelTrimService::TickCallBack(void *fuelTrimService)
	{
		((IFuelTrimService*)fuelTrimService)->Tick();
	}
}