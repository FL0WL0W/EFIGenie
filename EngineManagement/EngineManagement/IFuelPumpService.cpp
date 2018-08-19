#include "IFuelPumpService.h"

namespace ApplicationService
{
	void IFuelPumpService::TickCallBack(void *fuelPumpService)
	{
		((IFuelPumpService*)fuelPumpService)->Tick();
	}

	void IFuelPumpService::PrimeCallBack(void *fuelPumpService)
	{
		((IFuelPumpService*)fuelPumpService)->Prime();
	}

	void IFuelPumpService::OnCallBack(void *fuelPumpService)
	{
		((IFuelPumpService*)fuelPumpService)->On();
	}

	void IFuelPumpService::OffCallBack(void *fuelPumpService)
	{
		((IFuelPumpService*)fuelPumpService)->Off();
	}
}