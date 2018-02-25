#include "Services.h"
#include "PistonEngineFactory.h"

#ifdef PrimeService_StaticPulseWidthExists
namespace EngineManagement
{
	PrimeService_StaticPulseWidth::PrimeService_StaticPulseWidth(void *config)
	{
		_pulseWidth = *(float *)config * CurrentTimerService->GetTicksPerSecond();
		config = (void*)((float *)config + 1);
	}

	void PrimeService_StaticPulseWidth::Prime()
	{
		if (!_started)
		{
			unsigned int currentTick = CurrentTimerService->GetTick();
			for (unsigned char cylinder = 0; cylinder < CurrentPistonEngineConfig->Cylinders; cylinder++)
			{
				CurrentInjectorServices[cylinder]->InjectorOpen();
				CurrentTimerService->ScheduleTask(&IInjectorService::InjectorCloseTask, CurrentInjectorServices[cylinder], currentTick + _pulseWidth, true);
			}
		}
	}

	void PrimeService_StaticPulseWidth::Tick()
	{
		_started = true;
	}
}
#endif