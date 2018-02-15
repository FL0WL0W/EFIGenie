#ifndef NOINJECTION
#include "Services.h"
#include "PrimeService_StaticPulseWidth.h"

namespace EngineManagement
{
	PrimeService_StaticPulseWidth::PrimeService_StaticPulseWidth(void *config)
	{
		_pulseWidth = *(float *)config * CurrentTimerService->GetTicksPerSecond();
		config = (void*)((float *)config + 1);
	}
	
	void PrimeService_StaticPulseWidth::PrimeTick()
	{
		if (!_started)
		{
			unsigned int currentTick = CurrentTimerService->GetTick();
			for (unsigned char cylinder = 0; cylinder < CurrentPistonEngineConfig->Cylinders; cylinder++)
			{
				CurrentInjectorServices[cylinder]->InjectorOpen();
				CurrentTimerService->ScheduleTask(&IInjectorService::InjectorCloseTask, CurrentInjectorServices[cylinder], currentTick + _pulseWidth, INJECTOR_TASK_PRIORITY, true);
			}
		}
		else
		{
			_started = true;
		}
	}
}
#endif