#include "PrimeService_StaticPulseWidth.h"

#ifdef PRIMESERVICE_STATICPULSEWIDTH_H
namespace ApplicationService
{
	PrimeService_StaticPulseWidth::PrimeService_StaticPulseWidth(const PrimeService_StaticPulseWidthConfig *config, ITimerService *timerService, IBooleanOutputService **injectorServices)
	{
		_timerService = timerService;
		_injectorServices = injectorServices;
		
		_pulseTick = config->PulseWidth * _timerService->GetTicksPerSecond();
	}

	void PrimeService_StaticPulseWidth::Prime()
	{
		if (!_started)
		{
			unsigned int currentTick = _timerService->GetTick();
			for (unsigned char injector = 0; _injectorServices[injector] != 0; injector++)
			{
				_injectorServices[injector]->OutputSet();
				_timerService->ScheduleTask(&IBooleanOutputService::OutputResetTask, _injectorServices[injector], currentTick + _pulseTick, true);
			}
		}
	}

	void PrimeService_StaticPulseWidth::Tick()
	{
		_started = true;
	}
}
#endif