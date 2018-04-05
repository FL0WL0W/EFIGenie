#include "Services.h"
#include "PistonEngineFactory.h"

#ifdef PrimeService_StaticPulseWidthExists
namespace EngineManagement
{
	PrimeService_StaticPulseWidth::PrimeService_StaticPulseWidth(const PrimeService_StaticPulseWidthConfig *config)
	{
		_pulseWidth = config->PulseWidth * CurrentTimerService->GetTicksPerSecond();
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