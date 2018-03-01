#include "Services.h"
#include "FuelTrimService_Narrow.h"

#ifdef FuelTrimService_NarrowExists
namespace EngineManagement
{
	FuelTrimService_Narrow::FuelTrimService_Narrow(void *config)
	{
		//TODO: config
	}
	
	short FuelTrimService_Narrow::GetFuelTrim(unsigned char cylinder)
	{
		return _fuelTrim;
	}
	
	void FuelTrimService_Narrow::TrimTick()
	{
		if (CurrentAfrService->Lambda < 1 + _lambdaDeltaEnable || CurrentAfrService->Lambda > 1 - _lambdaDeltaEnable)
		{
			if (_lambdaSensorService->Lambda < CurrentAfrService->Lambda) //rich
			{
				_fuelTrim -= _proportion;
			}
			else if (_lambdaSensorService->Lambda > CurrentAfrService->Lambda) //lean
			{
				_fuelTrim += _proportion;
			}
		}
		else
		{
			_fuelTrim = 0;
		}
	}
}
#endif 
